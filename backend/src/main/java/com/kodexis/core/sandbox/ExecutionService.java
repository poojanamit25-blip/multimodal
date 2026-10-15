package com.kodexis.core.sandbox;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kodexis.core.model.Enums;
import com.kodexis.core.model.TestCase;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class ExecutionService {

    private static final String PISTON_URL = "https://emkc.org/api/v2/piston/execute";
    private final RestTemplate restTemplate;

    public ExecutionService() {
        this.restTemplate = new RestTemplate();
    }

    public static class ExecutionOutcome {
        private Enums.ExecutionResultStatus status;
        private int passedCases;
        private int totalCases;
        private long executionTimeMs;
        private String consoleOutput;
        // memoryUsed is null when the sandbox does not track memory (local runtime).
        // The frontend must display "Not available" when this is null.
        private Long memoryUsedKb = null;
        private List<TestCaseResult> details = new ArrayList<>();

        // Constructor
        public ExecutionOutcome(Enums.ExecutionResultStatus status, int passedCases, int totalCases, long executionTimeMs, String consoleOutput) {
            this.status = status;
            this.passedCases = passedCases;
            this.totalCases = totalCases;
            this.executionTimeMs = executionTimeMs;
            this.consoleOutput = consoleOutput;
        }

        // Getters
        public Enums.ExecutionResultStatus getStatus() { return status; }
        public int getPassedCases() { return passedCases; }
        public int getTotalCases() { return totalCases; }
        public long getExecutionTimeMs() { return executionTimeMs; }
        public String getConsoleOutput() { return consoleOutput; }
        public Long getMemoryUsedKb() { return memoryUsedKb; }
        public List<TestCaseResult> getDetails() { return details; }
    }

    public static class TestCaseResult {
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private String error;

        public TestCaseResult(String input, String expectedOutput, String actualOutput, boolean passed, String error) {
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.actualOutput = actualOutput;
            this.passed = passed;
            this.error = error;
        }

        // Getters
        public String getInput() { return input; }
        public String getExpectedOutput() { return expectedOutput; }
        public String getActualOutput() { return actualOutput; }
        public boolean isPassed() { return passed; }
        public String getError() { return error; }
    }

    public ExecutionOutcome runCode(String code, Enums.Language language, List<TestCase> testCases) {
        if (testCases == null || testCases.isEmpty()) {
            // Run a simple dry-run without test cases
            TestCase dryRunCase = new TestCase("", "", false);
            return executeAgainstSingleCase(code, language, dryRunCase, 1, 1);
        }

        int passed = 0;
        long totalTime = 0L;
        StringBuilder finalLogs = new StringBuilder();
        List<TestCaseResult> detailsList = new ArrayList<>();
        Enums.ExecutionResultStatus overallStatus = Enums.ExecutionResultStatus.SUCCESS;

        for (TestCase tc : testCases) {
            ExecutionOutcome result = executeAgainstSingleCase(code, language, tc, passed + 1, testCases.size());
            totalTime += result.getExecutionTimeMs();

            boolean isCasePassed = result.getStatus() == Enums.ExecutionResultStatus.SUCCESS;
            if (isCasePassed) {
                passed++;
                detailsList.add(new TestCaseResult(tc.getInput(), tc.getExpectedOutput(), result.getConsoleOutput().trim(), true, null));
            } else {
                overallStatus = result.getStatus(); // Bubble up the last failure status
                detailsList.add(new TestCaseResult(tc.getInput(), tc.getExpectedOutput(), result.getConsoleOutput().trim(), false, result.getConsoleOutput()));
                finalLogs.append(String.format("Test Case Failed on Input:\n%s\nExpected:\n%s\nActual Output/Error:\n%s\n\n",
                        tc.getInput(), tc.getExpectedOutput(), result.getConsoleOutput()));
            }
        }

        ExecutionOutcome finalOutcome = new ExecutionOutcome(
                passed == testCases.size() ? Enums.ExecutionResultStatus.SUCCESS : overallStatus,
                passed,
                testCases.size(),
                totalTime,
                passed == testCases.size() ? "All test cases passed." : finalLogs.toString()
        );
        finalOutcome.details = detailsList;
        return finalOutcome;
    }

    private String getPythonCommand() {
        try {
            new ProcessBuilder("python", "--version").start().waitFor();
            return "python";
        } catch (Exception e) {
            return "py";
        }
    }

    private void cleanupDirectory(java.io.File dir) {
        if (dir.isDirectory()) {
            java.io.File[] files = dir.listFiles();
            if (files != null) {
                for (java.io.File f : files) {
                    f.delete();
                }
            }
            dir.delete();
        }
    }

    private ExecutionOutcome executeAgainstSingleCase(String code, Enums.Language language, TestCase testCase, int currentIdx, int totalCount) {
        String tempDir = System.getProperty("java.io.tmpdir") + "/kodexis_sandbox_" + System.currentTimeMillis() + "_" + currentIdx;
        java.io.File dir = new java.io.File(tempDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        long start = System.currentTimeMillis();
        try {
            String fileName = getPistonFilename(language);
            java.io.File sourceFile = new java.io.File(dir, fileName);
            java.nio.file.Files.writeString(sourceFile.toPath(), code);

            // Command configuration based on language
            List<String> compileCmd = null;
            List<String> runCmd = null;
            String execName = null;

            switch (language) {
                case PYTHON -> {
                    runCmd = List.of(getPythonCommand(), sourceFile.getAbsolutePath());
                }
                case JAVASCRIPT -> {
                    runCmd = List.of("node", sourceFile.getAbsolutePath());
                }
                case JAVA -> {
                    compileCmd = List.of("javac", sourceFile.getAbsolutePath());
                    runCmd = List.of("java", "-cp", dir.getAbsolutePath(), "Main");
                }
                case CPP -> {
                    execName = tempDir + "/main_cpp.exe";
                    compileCmd = List.of("g++", "-O3", sourceFile.getAbsolutePath(), "-o", execName);
                    runCmd = List.of(execName);
                }
                case C -> {
                    execName = tempDir + "/main_c.exe";
                    compileCmd = List.of("gcc", sourceFile.getAbsolutePath(), "-o", execName);
                    runCmd = List.of(execName);
                }
                case CSHARP -> {
                    execName = tempDir + "/Program.exe";
                    compileCmd = List.of("csc", "-out:" + execName, sourceFile.getAbsolutePath());
                    runCmd = List.of(execName);
                }
                case GO -> {
                    runCmd = List.of("go", "run", sourceFile.getAbsolutePath());
                }
            }

            // 1. Compile step (if needed)
            if (compileCmd != null) {
                ProcessBuilder pbCompile = new ProcessBuilder(compileCmd);
                pbCompile.directory(dir);
                Process compileProcess = pbCompile.start();
                int compileExit = compileProcess.waitFor();
                if (compileExit != 0) {
                    String compileErrors = new String(compileProcess.getErrorStream().readAllBytes());
                    cleanupDirectory(dir);
                    return new ExecutionOutcome(Enums.ExecutionResultStatus.COMPILE_ERROR, 0, 1, System.currentTimeMillis() - start, "Compilation Error:\n" + compileErrors);
                }
            }

            // 2. Run step
            if (runCmd != null) {
                ProcessBuilder pbRun = new ProcessBuilder(runCmd);
                pbRun.directory(dir);
                Process runProcess = pbRun.start();

                // Pipe standard input (stdin)
                if (testCase.getInput() != null && !testCase.getInput().isEmpty()) {
                    java.io.OutputStream os = runProcess.getOutputStream();
                    os.write(testCase.getInput().getBytes());
                    os.flush();
                    os.close();
                }

                // Wait with a timeout (e.g. 5 seconds to prevent infinite loops!)
                boolean finished = runProcess.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);
                long duration = System.currentTimeMillis() - start;

                if (!finished) {
                    runProcess.destroyForcibly();
                    cleanupDirectory(dir);
                    // Return TIMEOUT status (not RUNTIME_ERROR) so frontend can display TLE clearly
                    return new ExecutionOutcome(Enums.ExecutionResultStatus.TIMEOUT, 0, 1, duration, "TIME LIMIT EXCEEDED\nYour solution exceeded the 5-second execution limit.\nThis usually indicates an infinite loop or an algorithm with very high time complexity.\nOptimize your approach and try again.");
                }

                int runExit = runProcess.exitValue();
                String stdout = new String(runProcess.getInputStream().readAllBytes()).trim();
                String stderr = new String(runProcess.getErrorStream().readAllBytes()).trim();

                cleanupDirectory(dir);

                if (runExit != 0 || !stderr.isEmpty()) {
                    String errorMsg = !stderr.isEmpty() ? stderr : "Process exited with code " + runExit;
                    return new ExecutionOutcome(Enums.ExecutionResultStatus.RUNTIME_ERROR, 0, 1, duration, errorMsg);
                }

                // Verify stdout matches expected output.
                // Normalize both sides: convert CRLF → LF, trim each line, collapse to a
                // canonical form so Windows line-endings or trailing spaces don't cause
                // spurious Wrong Answer verdicts.
                String normalizedExpected = normalizeOutput(testCase.getExpectedOutput());
                String normalizedActual   = normalizeOutput(stdout);
                if (normalizedActual.equals(normalizedExpected)) {
                    return new ExecutionOutcome(Enums.ExecutionResultStatus.SUCCESS, 1, 1, duration, stdout);
                } else {
                    return new ExecutionOutcome(Enums.ExecutionResultStatus.WRONG_ANSWER, 0, 1, duration, stdout);
                }
            }

            cleanupDirectory(dir);
            return new ExecutionOutcome(Enums.ExecutionResultStatus.RUNTIME_ERROR, 0, 1, System.currentTimeMillis() - start, "Execution failed: No run command configured.");

        } catch (java.io.IOException | InterruptedException e) {
            cleanupDirectory(dir);
            long duration = System.currentTimeMillis() - start;
            return new ExecutionOutcome(
                Enums.ExecutionResultStatus.RUNTIME_ERROR,
                0,
                1,
                duration,
                "Local Runtime Missing: " + e.getMessage() + "\nMake sure the local runtime (e.g. node, python, javac, csc, or go) is installed and available in system PATH."
            );
        }
    }

    /**
     * Normalizes output for comparison:
     * - Replaces Windows CRLF (\r\n) and bare CR (\r) with LF (\n)
     * - Trims leading/trailing whitespace from each individual line
     * - Removes trailing blank lines
     * This prevents false Wrong Answer verdicts caused by whitespace differences.
     */
    private String normalizeOutput(String raw) {
        if (raw == null) return "";
        // Unify line endings
        String unified = raw.replace("\r\n", "\n").replace("\r", "\n");
        // Trim each line
        String[] lines = unified.split("\n", -1);
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            sb.append(line.stripTrailing()).append("\n");
        }
        // Strip trailing blank lines
        return sb.toString().stripTrailing();
    }

    private String getPistonLanguage(Enums.Language language) {
        return switch (language) {
            case JAVA -> "java";
            case PYTHON -> "python";
            case JAVASCRIPT -> "javascript";
            case CPP -> "c++";
            case C -> "c";
            case CSHARP -> "csharp";
            case GO -> "go";
        };
    }

    private String getPistonFilename(Enums.Language language) {
        return switch (language) {
            case JAVA -> "Main.java";
            case PYTHON -> "main.py";
            case JAVASCRIPT -> "index.js";
            case CPP -> "main.cpp";
            case C -> "main.c";
            case CSHARP -> "Program.cs";
            case GO -> "main.go";
        };
    }

    // Piston API Model classes
    private static class PistonRequest {
        @JsonProperty("language") private String language;
        @JsonProperty("version") private String version;
        @JsonProperty("files") private List<PistonFile> files;
        @JsonProperty("stdin") private String stdin;

        public PistonRequest(String language, String version, List<PistonFile> files, String stdin) {
            this.language = language;
            this.version = version;
            this.files = files;
            this.stdin = stdin;
        }

        public String getLanguage() { return language; }
        public String getVersion() { return version; }
        public List<PistonFile> getFiles() { return files; }
        public String getStdin() { return stdin; }
    }

    private static class PistonFile {
        @JsonProperty("name") private String name;
        @JsonProperty("content") private String content;

        public PistonFile(String name, String content) {
            this.name = name;
            this.content = content;
        }

        public String getName() { return name; }
        public String getContent() { return content; }
    }

    private static class PistonResponse {
        @JsonProperty("language") private String language;
        @JsonProperty("version") private String version;
        @JsonProperty("run") private PistonRunResult run;

        public String getLanguage() { return language; }
        public String getVersion() { return version; }
        public PistonRunResult getRun() { return run; }
    }

    private static class PistonRunResult {
        @JsonProperty("stdout") private String stdout;
        @JsonProperty("stderr") private String stderr;
        @JsonProperty("code") private Integer code;
        @JsonProperty("signal") private String signal;
        @JsonProperty("output") private String output;

        public String getStdout() { return stdout; }
        public String getStderr() { return stderr; }
        public Integer getCode() { return code; }
        public String getSignal() { return signal; }
        public String getOutput() { return output; }
    }
}
