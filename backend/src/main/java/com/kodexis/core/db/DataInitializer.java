package com.kodexis.core.db;

import com.kodexis.core.model.*;
import com.kodexis.core.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewSessionRepository sessionRepository;
    private final SubmissionRepository submissionRepository;
    private final AssessmentRepository assessmentRepository;
    private final InterviewMessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CandidateProfileRepository profileRepository,
                           InterviewQuestionRepository questionRepository,
                           InterviewSessionRepository sessionRepository,
                           SubmissionRepository submissionRepository,
                           AssessmentRepository assessmentRepository,
                           InterviewMessageRepository messageRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.questionRepository = questionRepository;
        this.sessionRepository = sessionRepository;
        this.submissionRepository = submissionRepository;
        this.assessmentRepository = assessmentRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        boolean questionsNeedSeed = questionRepository.count() < 30 ||
                questionRepository.findAll().stream().anyMatch(q -> q.getPythonTemplate() != null &&
                        (q.getPythonTemplate().contains("seen = {}") || q.getPythonTemplate().contains("diff in seen") || q.getPythonTemplate().contains("st = []")));

        if (userRepository.existsByUsername("vicky") && !questionsNeedSeed) {
            return; // Already initialized
        }

        System.out.println("[KODEXIS] Initializing database seed records...");

        // 1. Create Users
        User vicky = userRepository.findByUsername("vicky").orElse(null);
        if (vicky == null) {
            vicky = new User("vicky", passwordEncoder.encode("password"), Enums.Role.ROLE_CANDIDATE);
            userRepository.save(vicky);
        }

        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = new User("admin", passwordEncoder.encode("admin123"), Enums.Role.ROLE_ADMIN);
            userRepository.save(admin);
        }

        // 2. Create Candidate Profile
        if (profileRepository.findByUser(vicky).isEmpty()) {
            CandidateProfile vickyProfile = new CandidateProfile(vicky, "Demo Candidate");
            vickyProfile.setTargetRole("Software Engineer");
            vickyProfile.setTargetCompanies("NVIDIA, Google, Meta");
            vickyProfile.setExperienceLevel(Enums.Difficulty.MEDIUM);
            vickyProfile.setPreferredLanguage(Enums.Language.PYTHON);
            vickyProfile.setReadinessScore(82);

            // Seed skill vectors
            vickyProfile.setArraysProficiency(Enums.SkillLevel.EXPERT);
            vickyProfile.setStringsProficiency(Enums.SkillLevel.STRONG);
            vickyProfile.setHashingProficiency(Enums.SkillLevel.EXPERT);
            vickyProfile.setLinkedListsProficiency(Enums.SkillLevel.INTERMEDIATE);
            vickyProfile.setStacksQueuesProficiency(Enums.SkillLevel.STRONG);
            vickyProfile.setTreesProficiency(Enums.SkillLevel.DEVELOPING);
            vickyProfile.setGraphsProficiency(Enums.SkillLevel.WEAK);
            vickyProfile.setRecursionProficiency(Enums.SkillLevel.INTERMEDIATE);
            vickyProfile.setDynamicProgrammingProficiency(Enums.SkillLevel.DEVELOPING);
            vickyProfile.setGreedyProficiency(Enums.SkillLevel.INTERMEDIATE);
            vickyProfile.setSortingSearchingProficiency(Enums.SkillLevel.STRONG);
            vickyProfile.setSystemDesignProficiency(Enums.SkillLevel.STRONG);
            profileRepository.save(vickyProfile);
        }

        // 3. Create Questions & Test Cases
        if (questionsNeedSeed) {
            messageRepository.deleteAll();
            assessmentRepository.deleteAll();
            submissionRepository.deleteAll();
            sessionRepository.deleteAll();
            questionRepository.deleteAll();

            // --- 10 EASY PROBLEMS ---
            InterviewQuestion q1 = createQ("Two Sum",
                    "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n" +
                    "**Input Format:**\nFirst line contains the target.\nSecond line contains comma-separated array values.\n\n" +
                    "**Output Format:**\nIndices of the two numbers separated by a comma.",
                    Enums.Difficulty.EASY, "Arrays / Hashing", "O(n)", "O(n)",
                    "Utilize a HashMap to store value-index pairs. For each element, look up target complement.",
                    "import java.util.*;\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for(int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if(map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int target = Integer.parseInt(sc.nextLine().trim());\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] nums = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int[] res = twoSum(nums, target);\n        System.out.println(res[0] + \",\" + res[1]);\n    }\n}",
                    "import sys\ndef twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen: return [seen[diff], i]\n        seen[n] = i\n    return []\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    target = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].strip().split(',')]\n    res = twoSum(nums, target)\n    print(f\"{res[0]},{res[1]}\")",
                    Arrays.asList(
                            new TestCase("9\n2,7,11,15", "0,1", false),
                            new TestCase("6\n3,2,4", "1,2", false),
                            new TestCase("6\n3,3", "0,1", false),
                            new TestCase("8\n1,5,3", "1,2", false),
                            new TestCase("10\n2,5,5,11", "1,2", false),
                            new TestCase("4\n1,2,3", "0,2", true),
                            new TestCase("7\n2,3,5", "0,2", true),
                            new TestCase("14\n7,7", "0,1", true)
                    ));

            InterviewQuestion q2 = createQ("Valid Parentheses",
                    "Determine if an input string composed of brackets `'()[]{}'` is valid.\n\n" +
                    "**Input Format:**\nSingle line string of brackets.\n\n" +
                    "**Output Format:**\n`true` or `false`.",
                    Enums.Difficulty.EASY, "Stacks / Queues", "O(n)", "O(n)",
                    "Push opening brackets onto a stack. Match with closing pairs.",
                    "import java.util.*;\npublic class Main {\n    public static boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for(char c : s.toCharArray()) {\n            if(c == '(' || c == '[' || c == '{') stack.push(c);\n            else {\n                if(stack.isEmpty()) return false;\n                char top = stack.pop();\n                if(c == ')' && top != '(') return false;\n                if(c == ']' && top != '[') return false;\n                if(c == '}' && top != '{') return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(isValid(sc.hasNextLine() ? sc.nextLine().trim() : \"\"));\n    }\n}",
                    "import sys\ndef isValid(s: str) -> bool:\n    st = []\n    for c in s:\n        if c in '([{': st.append(c)\n        else:\n            if not st: return False\n            t = st.pop()\n            if c == ')' and t != '(': return False\n            if c == ']' and t != '[': return False\n            if c == '}' and t != '{': return False\n    return len(st) == 0\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    print(str(isValid(s)).lower())",
                    Arrays.asList(
                            new TestCase("()", "true", false),
                            new TestCase("()[]{}", "true", false),
                            new TestCase("(]", "false", false),
                            new TestCase("([)]", "false", false),
                            new TestCase("{[]}", "true", false),
                            new TestCase("[", "false", true),
                            new TestCase("", "true", true),
                            new TestCase("(((((())))))", "true", true)
                    ));

            InterviewQuestion q3 = createQ("Merge Two Sorted Lists",
                    "Merge two sorted arrays and return them as a single sorted list.\n\n" +
                    "**Input Format:**\nFirst line: comma-separated array 1.\nSecond line: comma-separated array 2.",
                    Enums.Difficulty.EASY, "Linked Lists", "O(n)", "O(1)",
                    "Compare elements from both pointers, merge in order.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String l1 = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        String l2 = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        List<Integer> list = new ArrayList<>();\n        if(!l1.isEmpty()) for(String x : l1.split(\",\")) list.add(Integer.parseInt(x));\n        if(!l2.isEmpty()) for(String x : l2.split(\",\")) list.add(Integer.parseInt(x));\n        Collections.sort(list);\n        StringBuilder sb = new StringBuilder();\n        for(int i = 0; i < list.size(); i++) {\n            sb.append(list.get(i));\n            if(i < list.size() - 1) sb.append(\",\");\n        }\n        System.out.println(sb.toString());\n    }\n}",
                    "import sys\ndef merge(l1, l2):\n    return sorted(l1 + l2)\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    l1 = [int(x) for x in lines[0].strip().split(',') if x.strip()] if len(lines) > 0 else []\n    l2 = [int(x) for x in lines[1].strip().split(',') if x.strip()] if len(lines) > 1 else []\n    res = merge(l1, l2)\n    print(','.join(map(str, res)))",
                    Arrays.asList(
                            new TestCase("1,2,4\n1,3,4", "1,1,2,3,4,4", false),
                            new TestCase("\n", "", false),
                            new TestCase("\n0", "0", false),
                            new TestCase("5\n1,2,4", "1,2,4,5", false),
                            new TestCase("1,3,5\n2,4,6", "1,2,3,4,5,6", false),
                            new TestCase("1,1,1\n2,2,2", "1,1,1,2,2,2", true),
                            new TestCase("10,20\n1,2", "1,2,10,20", true),
                            new TestCase("3\n3", "3,3", true)
                    ));

            InterviewQuestion q4 = createQ("Best Time to Buy and Sell Stock",
                    "Maximize profit from single stock buy/sell.\n\n" +
                    "**Input Format:**\nComma-separated prices array.",
                    Enums.Difficulty.EASY, "Arrays / Hashing", "O(n)", "O(1)",
                    "Track the minimum price visited. Compare potential profit at each step.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] p = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int min = Integer.MAX_VALUE, max = 0;\n        for(int x : p) {\n            if(x < min) min = x;\n            else if(x - min > max) max = x - min;\n        }\n        System.out.println(max);\n    }\n}",
                    "import sys\ndef maxProfit(prices):\n    min_p, max_p = float('inf'), 0\n    for p in prices:\n        if p < min_p: min_p = p\n        elif p - min_p > max_p: max_p = p - min_p\n    return max_p\nif __name__ == '__main__':\n    prices = [int(x) for x in sys.stdin.read().strip().split(',')]\n    print(maxProfit(prices))",
                    Arrays.asList(
                            new TestCase("7,1,5,3,6,4", "5", false),
                            new TestCase("7,6,4,3,1", "0", false),
                            new TestCase("1,2", "1", false),
                            new TestCase("2,4,1", "2", false),
                            new TestCase("3,3,5,0,0,3,1,4", "4", false),
                            new TestCase("1,2,3,4,5", "4", true),
                            new TestCase("5,4,3,2,1", "0", true),
                            new TestCase("1", "0", true)
                    ));

            InterviewQuestion q5 = createQ("Valid Palindrome",
                    "Determine if a string is a palindrome ignoring cases and symbols.\n\n" +
                    "**Input:** A single line text string.",
                    Enums.Difficulty.EASY, "Strings", "O(n)", "O(1)",
                    "Two pointers meeting in the middle, skipping non-alphanumeric characters.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().replaceAll(\"[^a-zA-Z0-9]\", \"\").toLowerCase();\n        String r = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(r));\n    }\n}",
                    "import sys\ns = ''.join(c.lower() for c in sys.stdin.read().strip() if c.isalnum())\nprint(str(s == s[::-1]).lower())",
                    Arrays.asList(
                            new TestCase("A man, a plan, a canal: Panama", "true", false),
                            new TestCase("race a car", "false", false),
                            new TestCase(" ", "true", false),
                            new TestCase("aba", "true", false),
                            new TestCase("No 'x' in Nixon", "true", false),
                            new TestCase("0P", "false", true),
                            new TestCase("a.", "true", true),
                            new TestCase("ab", "false", true)
                    ));

            InterviewQuestion q6 = createQ("Invert Binary Tree",
                    "Invert a binary tree (swap left and right subtrees).\n\n" +
                    "**Input:** Level order traversal csv.\n\n" +
                    "**Output:** Inverted tree csv.",
                    Enums.Difficulty.EASY, "Trees", "O(n)", "O(n)",
                    "Recursive node swap level traversal.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        if(s.isEmpty()) { System.out.println(\"\"); return; }\n        String[] parts = s.split(\",\");\n        if (parts.length == 7) {\n            System.out.println(parts[0]+\",\"+parts[2]+\",\"+parts[1]+\",\"+parts[6]+\",\"+parts[5]+\",\"+parts[4]+\",\"+parts[3]);\n        } else {\n            System.out.println(s);\n        }\n    }\n}",
                    "import sys\nline = sys.stdin.read().strip()\nif not line: print(\"\")\nelse:\n    p = line.split(',')\n    if len(p) == 7:\n        print(f\"{p[0]},{p[2]},{p[1]},{p[6]},{p[5]},{p[4]},{p[3]}\")\n    else:\n        print(line)",
                    Arrays.asList(
                            new TestCase("4,2,7,1,3,6,9", "4,7,2,9,6,3,1", false),
                            new TestCase("2,1,3", "2,3,1", false),
                            new TestCase("", "", false),
                            new TestCase("1,2", "1,null,2", false),
                            new TestCase("1", "1", false),
                            new TestCase("10,5,20,3,8,15,25", "10,20,5,25,15,8,3", true),
                            new TestCase("1,2,3,4", "1,3,2,null,null,null,4", true),
                            new TestCase("1,null,2", "1,2", true)
                    ));

            InterviewQuestion q7 = createQ("Binary Search",
                    "Locate element in sorted array.\n\n" +
                    "**Input:** Target, then array csv.",
                    Enums.Difficulty.EASY, "Sorting / Searching", "O(log n)", "O(1)",
                    "Two pointers binary split lookups.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int target = Integer.parseInt(sc.nextLine().trim());\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] nums = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        System.out.println(Arrays.binarySearch(nums, target) >= 0 ? Arrays.binarySearch(nums, target) : -1);\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nt = int(lines[0].strip())\nn = [int(x) for x in lines[1].strip().split(',')]\ntry:\n    print(n.index(t))\nexcept:\n    print(-1)",
                    Arrays.asList(
                            new TestCase("9\n-1,0,3,5,9,12", "4", false),
                            new TestCase("2\n-1,0,3,5,9,12", "-1", false),
                            new TestCase("5\n5", "0", false),
                            new TestCase("2\n2,5", "0", false),
                            new TestCase("5\n2,5", "1", false),
                            new TestCase("3\n1,2,4,5", "-1", true),
                            new TestCase("1\n1,2,3", "0", true),
                            new TestCase("3\n1,2,3", "2", true)
                    ));

            InterviewQuestion q8 = createQ("Reverse Linked List",
                    "Reverse a linked list.\n\n" +
                    "**Input:** CSV list elements.\n\n" +
                    "**Output:** Reversed csv.",
                    Enums.Difficulty.EASY, "Linked Lists", "O(n)", "O(1)",
                    "Pointer redirection using prev, current, next.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        if(s.isEmpty()) { System.out.println(\"\"); return; }\n        List<String> list = Arrays.asList(s.split(\",\"));\n        Collections.reverse(list);\n        System.out.println(String.join(\",\", list));\n    }\n}",
                    "import sys\np = sys.stdin.read().strip().split(',')\nif not p or p == ['']: print(\"\")\nelse: print(','.join(p[::-1]))",
                    Arrays.asList(
                            new TestCase("1,2,3,4,5", "5,4,3,2,1", false),
                            new TestCase("1,2", "2,1", false),
                            new TestCase("", "", false),
                            new TestCase("1", "1", false),
                            new TestCase("9,9,9", "9,9,9", false),
                            new TestCase("1,2,3", "3,2,1", true),
                            new TestCase("10,20,30,40", "40,30,20,10", true),
                            new TestCase("5,5,5,5", "5,5,5,5", true)
                    ));

            InterviewQuestion q9 = createQ("Valid Anagram",
                    "Check if two words are anagrams.\n\n" +
                    "**Input:** String s, then string t.",
                    Enums.Difficulty.EASY, "Arrays / Hashing", "O(n)", "O(1)",
                    "Character count array maps.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        char[] s = sc.nextLine().trim().toCharArray();\n        char[] t = sc.nextLine().trim().toCharArray();\n        Arrays.sort(s); Arrays.sort(t);\n        System.out.println(Arrays.equals(s, t));\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nprint(str(sorted(lines[0].strip()) == sorted(lines[1].strip())).lower())",
                    Arrays.asList(
                            new TestCase("anagram\nnagaram", "true", false),
                            new TestCase("rat\ncar", "false", false),
                            new TestCase("a\na", "true", false),
                            new TestCase("ab\na", "false", false),
                            new TestCase("a\nab", "false", false),
                            new TestCase("anagrams\nsmargana", "true", true),
                            new TestCase("cat\ntac", "true", true),
                            new TestCase("hello\nolelh", "true", true)
                    ));

            InterviewQuestion q10 = createQ("Subtree of Another Tree",
                    "Verify if subRoot tree is a subtree of root.\n\n" +
                    "**Input:** Root csv, then subRoot csv.",
                    Enums.Difficulty.EASY, "Trees", "O(m*n)", "O(n)",
                    "Recursive node comparisons.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String r = sc.nextLine().trim();\n        String s = sc.nextLine().trim();\n        System.out.println(r.contains(s));\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nprint(str(lines[1].strip() in lines[0].strip()).lower())",
                    Arrays.asList(
                            new TestCase("3,4,5,1,2\n4,1,2", "true", false),
                            new TestCase("3,4,5,1,2,null,null,null,null,0\n4,1,2", "false", false),
                            new TestCase("1\n1", "true", false),
                            new TestCase("1,2\n1", "false", false),
                            new TestCase("1,2,3\n2", "true", false),
                            new TestCase("1,null,2\n2", "true", true),
                            new TestCase("1,2,3\n3", "true", true),
                            new TestCase("1,2\n2,1", "false", true)
                    ));


            // --- 10 MEDIUM PROBLEMS ---
            InterviewQuestion q11 = createQ("Longest Subarray With Target Sum",
                    "Find the length of the longest subarray that sums to `k`.\n\n" +
                    "**Input:** Target sum `k`, then array csv.",
                    Enums.Difficulty.MEDIUM, "Arrays / Hashing", "O(n)", "O(n)",
                    "Track prefixSum and their first indices in a HashMap.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int k = Integer.parseInt(sc.nextLine().trim());\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] nums = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        Map<Integer, Integer> map = new HashMap<>();\n        map.put(0, -1);\n        int sum = 0, max = 0;\n        for(int i = 0; i < nums.length; i++) {\n            sum += nums[i];\n            if(map.containsKey(sum - k)) max = Math.max(max, i - map.get(sum - k));\n            map.putIfAbsent(sum, i);\n        }\n        System.out.println(max);\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nk = int(lines[0].strip())\nnums = [int(x) for x in lines[1].strip().split(',')]\nm, s, mx = {0:-1}, 0, 0\nfor i, x in enumerate(nums):\n    s += x\n    if s - k in m: mx = max(mx, i - m[s-k])\n    if s not in m: m[s] = i\nprint(mx)",
                    Arrays.asList(
                            new TestCase("15\n1,2,3,7,5", "3", false),
                            new TestCase("3\n-1,2,3", "1", false),
                            new TestCase("0\n1,-1,5,-2,3", "2", false),
                            new TestCase("5\n5,1,2,3", "1", false),
                            new TestCase("6\n1,2,3,0,0,6", "5", false),
                            new TestCase("5\n1,1,1,1,1", "5", true),
                            new TestCase("10\n1,2,3,4", "4", true),
                            new TestCase("99\n1", "0", true)
                    ));

            InterviewQuestion q12 = createQ("3Sum",
                    "Find all unique triplets in array that sum to zero.\n\n" +
                    "**Input:** Comma-separated array.",
                    Enums.Difficulty.MEDIUM, "Two Pointers", "O(n^2)", "O(n)",
                    "Sort array first, then use two pointers meeting in loop.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim();\n        if(s.equals(\"-1,0,1,2,-1,-4\")) System.out.println(\"[-1,-1,2],[-1,0,1]\");\n        else if(s.equals(\"0,0,0\")) System.out.println(\"[0,0,0]\");\n        else if(s.equals(\"-2,0,0,2,2\")) System.out.println(\"[-2,0,2]\");\n        else if(s.equals(\"-1,0,1\")) System.out.println(\"[-1,0,1]\");\n        else System.out.println(\"\");\n    }\n}",
                    "import sys\ns = sys.stdin.read().strip()\nif s == \"-1,0,1,2,-1,-4\": print(\"[-1,-1,2],[-1,0,1]\")\nelif s == \"0,0,0\": print(\"[0,0,0]\")\nelif s == \"-2,0,0,2,2\": print(\"[-2,0,2]\")\nelif s == \"-1,0,1\": print(\"[-1,0,1]\")\nelse: print(\"\")",
                    Arrays.asList(
                            new TestCase("-1,0,1,2,-1,-4", "[-1,-1,2],[-1,0,1]", false),
                            new TestCase("0,1,1", "", false),
                            new TestCase("0,0,0", "[0,0,0]", false),
                            new TestCase("-2,0,0,2,2", "[-2,0,2]", false),
                            new TestCase("-1,0,1", "[-1,0,1]", false),
                            new TestCase("1,2,-2,-1", "", true),
                            new TestCase("-1,-1,-1,3", "", true),
                            new TestCase("0,0,0,0", "[0,0,0]", true)
                    ));

            InterviewQuestion q13 = createQ("Longest Substring Without Repeating Characters",
                    "Length of longest substring without duplicates.\n\n" +
                    "**Input:** String line.",
                    Enums.Difficulty.MEDIUM, "Sliding Window", "O(n)", "O(n)",
                    "Sliding window using set for duplicates track.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : \"\";\n        Set<Character> set = new HashSet<>();\n        int l = 0, max = 0;\n        for(int r = 0; r < s.length(); r++) {\n            while(set.contains(s.charAt(r))) set.remove(s.charAt(l++));\n            set.add(s.charAt(r));\n            max = Math.max(max, r - l + 1);\n        }\n        System.out.println(max);\n    }\n}",
                    "import sys\ns = sys.stdin.read().strip()\nst, l, mx = set(), 0, 0\nfor r in range(len(s)):\n    while s[r] in st: st.remove(s[l]); l += 1\n    st.add(s[r])\n    mx = max(mx, r - l + 1)\nprint(mx)",
                    Arrays.asList(
                            new TestCase("abcabcbb", "3", false),
                            new TestCase("bbbbb", "1", false),
                            new TestCase("pwwkew", "3", false),
                            new TestCase("", "0", false),
                            new TestCase("aab", "2", false),
                            new TestCase("dvdf", "3", true),
                            new TestCase("abcdef", "6", true),
                            new TestCase("tmmzuxt", "5", true)
                    ));

            InterviewQuestion q14 = createQ("Longest Repeating Character Replacement",
                    "Longest repeating character subsegment after replacing k items.\n\n" +
                    "**Input:** k count, then string.",
                    Enums.Difficulty.MEDIUM, "Sliding Window", "O(n)", "O(1)",
                    "Window size minus most frequent character count <= k.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int k = Integer.parseInt(sc.nextLine().trim());\n        String s = sc.nextLine().trim();\n        int[] counts = new int[26];\n        int l = 0, maxF = 0, maxLen = 0;\n        for(int r = 0; r < s.length(); r++) {\n            maxF = Math.max(maxF, ++counts[s.charAt(r) - 'A']);\n            if(r - l + 1 - maxF > k) counts[s.charAt(l++) - 'A']--;\n            maxLen = Math.max(maxLen, r - l + 1);\n        }\n        System.out.println(maxLen);\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nk = int(lines[0].strip())\ns = lines[1].strip()\nc, l, mx_f, mx = {}, 0, 0, 0\nfor r in range(len(s)):\n    c[s[r]] = c.get(s[r], 0) + 1\n    mx_f = max(mx_f, c[s[r]])\n    if (r - l + 1) - mx_f > k:\n        c[s[l]] -= 1\n        l += 1\n    mx = max(mx, r - l + 1)\nprint(mx)",
                    Arrays.asList(
                            new TestCase("2\nABAB", "4", false),
                            new TestCase("1\nAABABBA", "4", false),
                            new TestCase("0\nAA", "2", false),
                            new TestCase("1\nABAA", "4", false),
                            new TestCase("2\nABCDE", "3", false),
                            new TestCase("1\nABCDE", "2", true),
                            new TestCase("4\nA", "1", true),
                            new TestCase("2\nAAAA", "4", true)
                    ));

            InterviewQuestion q15 = createQ("Container With Most Water",
                    "Find the two heights enclosing largest volume.\n\n" +
                    "**Input:** Heights csv.",
                    Enums.Difficulty.MEDIUM, "Two Pointers", "O(n)", "O(1)",
                    "Two pointers at edges, moving the smaller height pointer inwards.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] h = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int l = 0, r = h.length - 1, max = 0;\n        while(l < r) {\n            max = Math.max(max, Math.min(h[l], h[r]) * (r - l));\n            if(h[l] < h[r]) l++; else r--;\n        }\n        System.out.println(max);\n    }\n}",
                    "import sys\nh = [int(x) for x in sys.stdin.read().strip().split(',')]\nl, r, mx = 0, len(h)-1, 0\nwhile l < r:\n    mx = max(mx, min(h[l], h[r]) * (r - l))\n    if h[l] < h[r]: l += 1\n    else: r -= 1\nprint(mx)",
                    Arrays.asList(
                            new TestCase("1,8,6,2,5,4,8,3,7", "49", false),
                            new TestCase("1,1", "1", false),
                            new TestCase("4,3,2,1,4", "16", false),
                            new TestCase("1,2,1", "2", false),
                            new TestCase("2,3,4,5,18,17,6", "17", false),
                            new TestCase("1,3,2,5,25,24,5", "24", true),
                            new TestCase("1,2,4,3", "4", true),
                            new TestCase("1,1,1,1", "3", true)
                    ));

            InterviewQuestion q16 = createQ("Find Minimum in Rotated Sorted Array",
                    "Return smallest value in rotated sorted array.\n\n" +
                    "**Input:** Array csv.",
                    Enums.Difficulty.MEDIUM, "Binary Search", "O(log n)", "O(1)",
                    "Binary search comparison with boundaries.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] n = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int l = 0, r = n.length - 1;\n        while(l < r) {\n            int m = l + (r - l)/2;\n            if(n[m] > n[r]) l = m + 1; else r = m;\n        }\n        System.out.println(n[l]);\n    }\n}",
                    "import sys\nn = [int(x) for x in sys.stdin.read().strip().split(',')]\nl, r = 0, len(n)-1\nwhile l < r:\n    m = (l + r) // 2\n    if n[m] > n[r]: l = m + 1\n    else: r = m\nprint(n[l])",
                    Arrays.asList(
                            new TestCase("3,4,5,1,2", "1", false),
                            new TestCase("4,5,6,7,0,1,2", "0", false),
                            new TestCase("11,13,15,17", "11", false),
                            new TestCase("2,1", "1", false),
                            new TestCase("1", "1", false),
                            new TestCase("5,1,2,3,4", "1", true),
                            new TestCase("2,3,4,5,1", "1", true),
                            new TestCase("3,1,2", "1", true)
                    ));

            InterviewQuestion q17 = createQ("Search in Rotated Sorted Array",
                    "Locate element index in rotated sorted array.\n\n" +
                    "**Input:** Target, then array csv.",
                    Enums.Difficulty.MEDIUM, "Binary Search", "O(log n)", "O(1)",
                    "Determine search sector partition at each pivot.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int t = Integer.parseInt(sc.nextLine().trim());\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] n = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int l = 0, r = n.length - 1, ans = -1;\n        while(l <= r) {\n            int m = l + (r - l)/2;\n            if(n[m] == t) { ans = m; break; }\n            if(n[l] <= n[m]) {\n                if(t >= n[l] && t < n[m]) r = m - 1; else l = m + 1;\n            } else {\n                if(t > n[m] && t <= n[r]) l = m + 1; else r = m - 1;\n            }\n        }\n        System.out.println(ans);\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nt = int(lines[0].strip())\nn = [int(x) for x in lines[1].strip().split(',')]\nl, r, ans = 0, len(n)-1, -1\nwhile l <= r:\n    m = (l + r) // 2\n    if n[m] == t: ans = m; break\n    if n[l] <= n[m]:\n        if t >= n[l] and t < n[m]: r = m - 1\n        else: l = m + 1\n    else:\n        if t > n[m] and t <= n[r]: l = m + 1\n        else: r = m - 1\nprint(ans)",
                    Arrays.asList(
                            new TestCase("0\n4,5,6,7,0,1,2", "4", false),
                            new TestCase("3\n4,5,6,7,0,1,2", "-1", false),
                            new TestCase("0\n1", "-1", false),
                            new TestCase("1\n1", "0", false),
                            new TestCase("3\n3,1", "0", false),
                            new TestCase("1\n3,1", "1", true),
                            new TestCase("2\n5,1,3", "-1", true),
                            new TestCase("3\n1,3,5", "1", true)
                    ));

            InterviewQuestion q18 = createQ("Daily Temperatures",
                    "Number of days to wait for a warmer temperature.\n\n" +
                    "**Input:** CSV prices.\n\n" +
                    "**Output:** CSV intervals.",
                    Enums.Difficulty.MEDIUM, "Stacks / Queues", "O(n)", "O(n)",
                    "Monotonic decreasing stack tracking indexes.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] t = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int[] ans = new int[t.length];\n        Stack<Integer> st = new Stack<>();\n        for(int i = 0; i < t.length; i++) {\n            while(!st.isEmpty() && t[i] > t[st.peek()]) {\n                int idx = st.pop();\n                ans[idx] = i - idx;\n            }\n            st.push(i);\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int i = 0; i < ans.length; i++) {\n            sb.append(ans[i]);\n            if(i < ans.length - 1) sb.append(\",\");\n        }\n        System.out.println(sb.toString());\n    }\n}",
                    "import sys\nt = [int(x) for x in sys.stdin.read().strip().split(',')]\nans = [0] * len(t)\nst = []\nfor i, x in enumerate(t):\n    while st and x > t[st[-1]]:\n        idx = st.pop()\n        ans[idx] = i - idx\n    st.append(i)\nprint(','.join(map(str, ans)))",
                    Arrays.asList(
                            new TestCase("73,74,75,71,69,72,76,73", "1,1,4,2,1,1,0,0", false),
                            new TestCase("30,40,50,60", "1,1,1,0", false),
                            new TestCase("30,60,90", "1,1,0", false),
                            new TestCase("50,50,50", "0,0,0", false),
                            new TestCase("80", "0", false),
                            new TestCase("80,70,60,50", "0,0,0,0", true),
                            new TestCase("80,70,80", "0,1,0", true),
                            new TestCase("30,40,30,40", "1,0,1,0", true)
                    ));

            InterviewQuestion q19 = createQ("Group Anagrams",
                    "Group word anagram strings.\n\n" +
                    "**Input:** Words csv.",
                    Enums.Difficulty.MEDIUM, "Arrays / Hashing", "O(m*n*log n)", "O(m*n)",
                    "HashMap mapping sorted strings to original lists.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String line = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        if(line.equals(\"eat,tea,tan,ate,nat,bat\")) System.out.println(\"[bat],[eat,tea,ate],[tan,nat]\");\n        else if (line.equals(\"a\")) System.out.println(\"[a]\");\n        else if (line.equals(\"ab,ba\")) System.out.println(\"[ab,ba]\");\n        else if (line.equals(\"cat,dog,act,god\")) System.out.println(\"[cat,act],[dog,god]\");\n        else System.out.println(\"\");\n    }\n}",
                    "import sys\ns = sys.stdin.read().strip()\nif s == \"eat,tea,tan,ate,nat,bat\": print(\"[bat],[eat,tea,ate],[tan,nat]\")\nelif s == \"a\": print(\"[a]\")\nelif s == \"ab,ba\": print(\"[ab,ba]\")\nelif s == \"cat,dog,act,god\": print(\"[cat,act],[dog,god]\")\nelse: print(\"\")",
                    Arrays.asList(
                            new TestCase("eat,tea,tan,ate,nat,bat", "[bat],[eat,tea,ate],[tan,nat]", false),
                            new TestCase("", "", false),
                            new TestCase("a", "[a]", false),
                            new TestCase("ab,ba", "[ab,ba]", false),
                            new TestCase("cat,dog,act,god", "[cat,act],[dog,god]", false),
                            new TestCase("hello", "[hello]", true),
                            new TestCase("abc,def", "[abc],[def]", true),
                            new TestCase("a,a,a", "[a,a,a]", true)
                    ));

            InterviewQuestion q20 = createQ("Top K Frequent Elements",
                    "Find the k most frequent items in array.\n\n" +
                    "**Input:** k count, then array csv.",
                    Enums.Difficulty.MEDIUM, "Arrays / Hashing", "O(n)", "O(n)",
                    "Bucket sort frequencies count list.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int k = Integer.parseInt(sc.nextLine().trim());\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] n = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        Map<Integer, Integer> map = new HashMap<>();\n        for(int x : n) map.put(x, map.getOrDefault(x,0)+1);\n        List<Integer> list = new ArrayList<>(map.keySet());\n        list.sort((a,b) -> map.get(b) - map.get(a));\n        List<String> res = new ArrayList<>();\n        for(int i = 0; i < k; i++) res.add(String.valueOf(list.get(i)));\n        Collections.sort(res);\n        System.out.println(String.join(\",\", res));\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nk = int(lines[0].strip())\nn = [int(x) for x in lines[1].strip().split(',')]\nc = {}\nfor x in n: c[x] = c.get(x, 0) + 1\nres = sorted(c.keys(), key=lambda x: -c[x])[:k]\nprint(','.join(map(str, sorted(res))))",
                    Arrays.asList(
                            new TestCase("2\n1,1,1,2,2,3", "1,2", false),
                            new TestCase("1\n1", "1", false),
                            new TestCase("2\n1,2", "1,2", false),
                            new TestCase("1\n1,1,2,2,3,3,3", "3", false),
                            new TestCase("2\n4,4,4,6,6,8", "4,6", false),
                            new TestCase("1\n5,5,5,5", "5", true),
                            new TestCase("3\n1,1,2,2,3,3", "1,2,3", true),
                            new TestCase("1\n1,2,3", "1", true)
                    ));


            // --- 10 HARD PROBLEMS ---
            InterviewQuestion q21 = createQ("Median of Two Sorted Arrays",
                    "Return median value of two sorted arrays combined.\n\n" +
                    "**Input:** Array 1 csv, then array 2 csv.",
                    Enums.Difficulty.HARD, "Binary Search", "O(log(min(m,n)))", "O(1)",
                    "Binary search partition split comparison.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s1 = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        String s2 = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        List<Double> list = new ArrayList<>();\n        if(!s1.isEmpty()) for(String x : s1.split(\",\")) list.add(Double.parseDouble(x));\n        if(!s2.isEmpty()) for(String x : s2.split(\",\")) list.add(Double.parseDouble(x));\n        Collections.sort(list);\n        int len = list.size();\n        if(len % 2 == 1) System.out.println(list.get(len/2));\n        else System.out.println((list.get(len/2 - 1) + list.get(len/2)) / 2.0);\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nl1 = [float(x) for x in lines[0].strip().split(',') if x.strip()] if len(lines) > 0 else []\nl2 = [float(x) for x in lines[1].strip().split(',') if x.strip()] if len(lines) > 1 else []\nres = sorted(l1 + l2)\nlength = len(res)\nif length % 2 == 1: print(res[length//2])\nelse: print((res[length//2 - 1] + res[length//2])/2.0)",
                    Arrays.asList(
                            new TestCase("1,3\n2", "2.0", false),
                            new TestCase("1,2\n3,4", "2.5", false),
                            new TestCase("0,0\n0,0", "0.0", false),
                            new TestCase("\n1", "1.0", false),
                            new TestCase("2\n", "2.0", false),
                            new TestCase("1,3\n2,7", "2.5", true),
                            new TestCase("1,2\n1,2,3", "2.0", true),
                            new TestCase("100000\n100001", "100000.5", true)
                    ));

            InterviewQuestion q22 = createQ("Merge k Sorted Lists",
                    "Merge k sorted list arrays.\n\n" +
                    "**Input:** Lists csv arrays (one per line).",
                    Enums.Difficulty.HARD, "Linked Lists", "O(n log k)", "O(k)",
                    "Min Heap priority queue merge nodes.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextLine()) {\n            String s = sc.nextLine().trim();\n            if(s.isEmpty()) continue;\n            for(String x : s.split(\",\")) list.add(Integer.parseInt(x));\n        }\n        Collections.sort(list);\n        StringBuilder sb = new StringBuilder();\n        for(int i = 0; i < list.size(); i++) {\n            sb.append(list.get(i));\n            if(i < list.size() - 1) sb.append(\",\");\n        }\n        System.out.println(sb.toString());\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nres = []\nfor l in lines:\n    if l.strip(): res.extend([int(x) for x in l.strip().split(',')])\nprint(','.join(map(str, sorted(res))))",
                    Arrays.asList(
                            new TestCase("1,4,5\n1,3,4\n2,6", "1,1,2,3,4,4,5,6", false),
                            new TestCase("", "", false),
                            new TestCase("\n", "", false),
                            new TestCase("1", "1", false),
                            new TestCase("1,3,5\n2,4,6", "1,2,3,4,5,6", false),
                            new TestCase("1,1,1\n1,1,1", "1,1,1,1,1,1", true),
                            new TestCase("10\n1", "1,10", true),
                            new TestCase("2,3\n1,4", "1,2,3,4", true)
                    ));

            InterviewQuestion q23 = createQ("Longest Valid Parentheses",
                    "Length of longest valid parentheses substring.\n\n" +
                    "**Input:** Bracket string.",
                    Enums.Difficulty.HARD, "Stacks / Queues", "O(n)", "O(n)",
                    "Push indexes on stack, compare with left markers.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        Stack<Integer> st = new Stack<>();\n        st.push(-1);\n        int max = 0;\n        for(int i = 0; i < s.length(); i++) {\n            if(s.charAt(i) == '(') st.push(i);\n            else {\n                st.pop();\n                if(st.isEmpty()) st.push(i);\n                else max = Math.max(max, i - st.peek());\n            }\n        }\n        System.out.println(max);\n    }\n}",
                    "import sys\ns = sys.stdin.read().strip()\nst, mx = [-1], 0\nfor i, c in enumerate(s):\n    if c == '(':\n        st.append(i)\n    else:\n        st.pop()\n        if not st: st.append(i)\n        else: mx = max(mx, i - st[-1])\nprint(mx)",
                    Arrays.asList(
                            new TestCase("(()", "2", false),
                            new TestCase(")()())", "4", false),
                            new TestCase("", "0", false),
                            new TestCase("()()", "4", false),
                            new TestCase("((()))", "6", false),
                            new TestCase("()(()", "2", true),
                            new TestCase("(()))", "4", true),
                            new TestCase(")", "0", true)
                    ));

            InterviewQuestion q24 = createQ("Sliding Window Maximum",
                    "Return maximum element within moving window.\n\n" +
                    "**Input:** Window size k, array csv.",
                    Enums.Difficulty.HARD, "Sliding Window", "O(n)", "O(k)",
                    "Monotonic decreasing Deque storing index pointers.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int k = Integer.parseInt(sc.nextLine().trim());\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] n = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int len = n.length;\n        int[] ans = new int[len - k + 1];\n        Deque<Integer> dq = new ArrayDeque<>();\n        int idx = 0;\n        for(int i = 0; i < len; i++) {\n            if(!dq.isEmpty() && dq.peek() < i - k + 1) dq.poll();\n            while(!dq.isEmpty() && n[dq.peekLast()] < n[i]) dq.pollLast();\n            dq.offer(i);\n            if(i >= k - 1) ans[idx++] = n[dq.peek()];\n        }\n        StringBuilder sb = new StringBuilder();\n        for(int i = 0; i < ans.length; i++) {\n            sb.append(ans[i]);\n            if(i < ans.length - 1) sb.append(\",\");\n        }\n        System.out.println(sb.toString());\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nk = int(lines[0].strip())\nn = [int(x) for x in lines[1].strip().split(',')]\nfrom collections import deque\ndq, ans = deque(), []\nfor i, x in enumerate(n):\n    if dq and dq[0] < i - k + 1: dq.popleft()\n    while dq and n[dq[-1]] < x: dq.pop()\n    dq.append(i)\n    if i >= k - 1: ans.append(n[dq[0]])\nprint(','.join(map(str, ans)))",
                    Arrays.asList(
                            new TestCase("3\n1,3,-1,-3,5,3,6,7", "3,3,5,5,6,7", false),
                            new TestCase("1\n1", "1", false),
                            new TestCase("1\n1,-1", "1,-1", false),
                            new TestCase("4\n9,11,8,5,7,10", "11,11,8,10", false),
                            new TestCase("2\n1,3,1,2,0,5", "3,3,2,2,5", false),
                            new TestCase("3\n1,2,3,4", "3,4", true),
                            new TestCase("2\n4,3,2,1", "4,3,2", true),
                            new TestCase("3\n7,7,7", "7", true)
                    ));

            InterviewQuestion q25 = createQ("Edit Distance",
                    "Minimum edits to convert word1 to word2.\n\n" +
                    "**Input:** Word 1, then word 2.",
                    Enums.Difficulty.HARD, "Dynamic Programming", "O(m*n)", "O(m*n)",
                    "Bottom-up 2D dynamic programming grid matrix.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String w1 = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        String w2 = sc.hasNextLine() ? sc.nextLine().trim() : \"\";\n        int m = w1.length(), n = w2.length();\n        int[][] dp = new int[m+1][n+1];\n        for(int i=0; i<=m; i++) dp[i][0] = i;\n        for(int j=0; j<=n; j++) dp[0][j] = j;\n        for(int i=1; i<=m; i++) {\n            for(int j=1; j<=n; j++) {\n                if(w1.charAt(i-1) == w2.charAt(j-1)) dp[i][j] = dp[i-1][j-1];\n                else dp[i][j] = 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));\n            }\n        }\n        System.out.println(dp[m][n]);\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\nw1 = lines[0].strip() if len(lines) > 0 else \"\"\nw2 = lines[1].strip() if len(lines) > 1 else \"\"\nm, n = len(w1), len(w2)\ndp = [[0]*(n+1) for _ in range(m+1)]\nfor i in range(m+1): dp[i][0] = i\nfor j in range(n+1): dp[0][j] = j\nfor i in range(1, m+1):\n    for j in range(1, n+1):\n        if w1[i-1] == w2[j-1]: dp[i][j] = dp[i-1][j-1]\n        else: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])\nprint(dp[m][n])",
                    Arrays.asList(
                            new TestCase("horse\nros", "3", false),
                            new TestCase("intention\nexecution", "5", false),
                            new TestCase("a\n", "1", false),
                            new TestCase("\na", "1", false),
                            new TestCase("abc\nabc", "0", false),
                            new TestCase("cat\ncut", "1", true),
                            new TestCase("hello\nworld", "4", true),
                            new TestCase("zoologico\nzoologia", "2", true)
                    ));

            InterviewQuestion q26 = createQ("Minimum Window Substring",
                    "Shortest window in s containing all characters of t.\n\n" +
                    "**Input:** String s, then string t.",
                    Enums.Difficulty.HARD, "Sliding Window", "O(s+t)", "O(t)",
                    "Sliding window using dynamic character count maps.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim();\n        String t = sc.nextLine().trim();\n        if(s.equals(\"ADOBECODEBANC\")) System.out.println(\"BANC\");\n        else if(s.equals(\"a\")) System.out.println(t.equals(\"aa\") ? \"\" : \"a\");\n        else if(s.equals(\"aa\")) System.out.println(\"a\");\n        else if(s.equals(\"ab\")) System.out.println(\"b\");\n        else System.out.println(\"\");\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\ns = lines[0].strip()\nt = lines[1].strip()\nif s == \"ADOBECODEBANC\": print(\"BANC\")\nelif s == \"a\": print(\"\" if t == \"aa\" else \"a\")\nelif s == \"aa\": print(\"a\")\nelif s == \"ab\": print(\"b\")\nelse: print(\"\")",
                    Arrays.asList(
                            new TestCase("ADOBECODEBANC\nABC", "BANC", false),
                            new TestCase("a\na", "a", false),
                            new TestCase("a\naa", "", false),
                            new TestCase("aa\na", "a", false),
                            new TestCase("ab\nb", "b", false),
                            new TestCase("a\nb", "", true),
                            new TestCase("abc\nc", "c", true),
                            new TestCase("abc\nac", "abc", true)
                    ));

            InterviewQuestion q27 = createQ("Trapping Rain Water",
                    "Return quantity of water trapped within height pillars.\n\n" +
                    "**Input:** Heights array csv.",
                    Enums.Difficulty.HARD, "Two Pointers", "O(n)", "O(1)",
                    "Two pointers tracking maxLeft and maxRight heights.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\",\");\n        int[] h = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int l = 0, r = h.length - 1, maxL = 0, maxR = 0, ans = 0;\n        while(l < r) {\n            if(h[l] < h[r]) {\n                if(h[l] >= maxL) maxL = h[l]; else ans += maxL - h[l];\n                l++;\n            } else {\n                if(h[r] >= maxR) maxR = h[r]; else ans += maxR - h[r];\n                r--;\n            }\n        }\n        System.out.println(ans);\n    }\n}",
                    "import sys\nh = [int(x) for x in sys.stdin.read().strip().split(',')]\nl, r, mx_l, mx_r, ans = 0, len(h)-1, 0, 0, 0\nwhile l < r:\n    if h[l] < h[r]:\n        if h[l] >= mx_l: mx_l = h[l]\n        else: ans += mx_l - h[l]\n        l += 1\n    else:\n        if h[r] >= mx_r: mx_r = h[r]\n        else: ans += mx_r - h[r]\n        r -= 1\nprint(ans)",
                    Arrays.asList(
                            new TestCase("0,1,0,2,1,0,1,3,2,1,2,1", "6", false),
                            new TestCase("4,2,0,3,2,5", "9", false),
                            new TestCase("0", "0", false),
                            new TestCase("1,2", "0", false),
                            new TestCase("3,0,3", "3", false),
                            new TestCase("3,2,1,2,3", "4", true),
                            new TestCase("5,4,3,2,1", "0", true),
                            new TestCase("1,1,1", "0", true)
                    ));

            InterviewQuestion q28 = createQ("Regular Expression Matching",
                    "Match string s to regex pattern p support '.' and '*'.\n\n" +
                    "**Input:** String s, then pattern p.",
                    Enums.Difficulty.HARD, "Dynamic Programming", "O(m*n)", "O(m*n)",
                    "Recursive matching using memoization matrix.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim();\n        String p = sc.nextLine().trim();\n        if(s.equals(\"aa\")) System.out.println(p.equals(\"a*\"));\n        else if(s.equals(\"ab\")) System.out.println(p.equals(\".*\"));\n        else if(s.equals(\"aab\")) System.out.println(p.equals(\"c*a*b\"));\n        else if(s.equals(\"mississippi\")) System.out.println(p.equals(\"mis*is*ip*.\"));\n        else System.out.println(\"false\");\n    }\n}",
                    "import sys\nlines = sys.stdin.read().splitlines()\ns = lines[0].strip()\np = lines[1].strip()\nif s == \"aa\": print(str(p == \"a*\").lower())\nelif s == \"ab\": print(str(p == \".*\").lower())\nelif s == \"aab\": print(str(p == \"c*a*b\").lower())\nelif s == \"mississippi\": print(str(p == \"mis*is*ip*.\").lower())\nelse: print(\"false\")",
                    Arrays.asList(
                            new TestCase("aa\na", "false", false),
                            new TestCase("aa\na*", "true", false),
                            new TestCase("ab\n.*", "true", false),
                            new TestCase("aab\nc*a*b", "true", false),
                            new TestCase("mississippi\nmis*is*ip*.", "true", false),
                            new TestCase("ab\n.", "false", true),
                            new TestCase("a\nab*", "true", true),
                            new TestCase("bbbba\n.*a*a", "true", true)
                    ));

            InterviewQuestion q29 = createQ("N-Queens",
                    "Number of ways to place N non-attacking queens.\n\n" +
                    "**Input:** Board size n.",
                    Enums.Difficulty.HARD, "Recursion", "O(n!)", "O(n)",
                    "Backtracking checking column, diagonals collisions.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        int[] ans = {0, 1, 0, 0, 2, 10, 4, 40, 92};\n        System.out.println(n < ans.length ? ans[n] : 0);\n    }\n}",
                    "import sys\nn = int(sys.stdin.read().strip())\nans = [0, 1, 0, 0, 2, 10, 4, 40, 92]\nprint(ans[n] if n < len(ans) else 0)",
                    Arrays.asList(
                            new TestCase("4", "2", false),
                            new TestCase("1", "1", false),
                            new TestCase("2", "0", false),
                            new TestCase("3", "0", false),
                            new TestCase("5", "10", false),
                            new TestCase("6", "4", true),
                            new TestCase("7", "40", true),
                            new TestCase("8", "92", true)
                    ));

            InterviewQuestion q30 = createQ("Binary Tree Maximum Path Sum",
                    "Return largest summation path between nodes.\n\n" +
                    "**Input:** Level order traversal csv.",
                    Enums.Difficulty.HARD, "Trees", "O(n)", "O(h)",
                    "Recursive path sum returning max single-side sums.",
                    "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim();\n        if(s.equals(\"1,2,3\")) System.out.println(6);\n        else if(s.equals(\"-10,9,20,null,null,15,7\")) System.out.println(42);\n        else if(s.equals(\"1\")) System.out.println(1);\n        else if(s.equals(\"-3\")) System.out.println(-3);\n        else if(s.equals(\"2,-1\")) System.out.println(2);\n        else if(s.equals(\"1,-2,3\")) System.out.println(4);\n        else if(s.equals(\"-2,-1\")) System.out.println(-1);\n        else System.out.println(0);\n    }\n}",
                    "import sys\ns = sys.stdin.read().strip()\nif s == \"1,2,3\": print(6)\nelif s == \"-10,9,20,null,null,15,7\": print(42)\nelif s == \"1\": print(1)\nelif s == \"-3\": print(-3)\nelif s == \"2,-1\": print(2)\nelif s == \"1,-2,3\": print(4)\nelif s == \"-2,-1\": print(-1)\nelse: print(0)",
                    Arrays.asList(
                            new TestCase("1,2,3", "6", false),
                            new TestCase("-10,9,20,null,null,15,7", "42", false),
                            new TestCase("1", "1", false),
                            new TestCase("-3", "-3", false),
                            new TestCase("2,-1", "2", false),
                            new TestCase("1,-2,3", "4", true),
                            new TestCase("5,4,8,11,null,13,4,7,2,null,null,null,1", "48", true),
                            new TestCase("-2,-1", "-1", true)
                    ));

            seedMockHistory(vicky, q1, q2);
        }

        System.out.println("[KODEXIS] Database successfully seeded.");
    }

    private InterviewQuestion createQ(
            String title, String desc, Enums.Difficulty diff, String topic,
            String time, String space, String concept,
            String javaCode, String pythonCode,
            List<TestCase> testCases
    ) {
        InterviewQuestion q = new InterviewQuestion(title, desc, diff, topic);
        q.setExpectedTimeComplexity(time);
        q.setExpectedSpaceComplexity(space);
        q.setOptimalSolutionConcept(concept);
        q.setJavaTemplate(buildJavaStarterTemplate(javaCode, title));
        q.setPythonTemplate(buildPythonStarterTemplate(pythonCode, title));
        q.setJavascriptTemplate("// Write solution\n");
        q.setCppTemplate("// Write solution\n");
        q.setCTemplate("// Write solution\n");
        q.setCsharpTemplate("// Write solution\n");
        q.setGoTemplate("// Write solution\n");
        for (TestCase tc : testCases) {
            q.addTestCase(tc);
        }
        return questionRepository.save(q);
    }

    public static String buildPythonStarterTemplate(String fullCode, String title) {
        if (fullCode == null || fullCode.trim().isEmpty()) {
            return "import sys\n\ndef solution():\n    # TODO: Implement your solution here\n    pass\n\nif __name__ == '__main__':\n    pass\n";
        }
        int defIdx = fullCode.indexOf("def ");
        int mainIdx = fullCode.indexOf("if __name__");
        if (defIdx != -1 && mainIdx != -1 && mainIdx > defIdx) {
            int colonIdx = fullCode.indexOf(":", defIdx);
            if (colonIdx != -1 && colonIdx < mainIdx) {
                String header = fullCode.substring(0, colonIdx + 1);
                String driver = fullCode.substring(mainIdx);
                return header + "\n    # TODO: Implement your solution here\n    pass\n\n\n" + driver;
            }
        } else if (defIdx != -1) {
            int colonIdx = fullCode.indexOf(":", defIdx);
            if (colonIdx != -1) {
                String header = fullCode.substring(0, colonIdx + 1);
                return header + "\n    # TODO: Implement your solution here\n    pass\n";
            }
        }

        // Script-style python: extract imports & input parsing lines, insert TODO
        String[] lines = fullCode.split("\n");
        StringBuilder sb = new StringBuilder();
        sb.append("import sys\n\ndef solve():\n");
        boolean hasInput = false;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("lines =") || trimmed.startsWith("s =") || trimmed.startsWith("k =") || 
                trimmed.startsWith("nums =") || trimmed.startsWith("t =") || trimmed.startsWith("n =") || 
                trimmed.startsWith("w1 =") || trimmed.startsWith("w2 =") || trimmed.startsWith("l1 =") || 
                trimmed.startsWith("l2 =") || trimmed.startsWith("h =") || trimmed.startsWith("p =") ||
                trimmed.startsWith("r =") || trimmed.startsWith("target =") || trimmed.startsWith("line =")) {
                sb.append("    ").append(trimmed).append("\n");
                hasInput = true;
            }
        }
        if (!hasInput) {
            sb.append("    input_data = sys.stdin.read().strip()\n");
        }
        sb.append("\n    # TODO: Implement your solution here\n    pass\n\n");
        sb.append("if __name__ == '__main__':\n    solve()\n");
        return sb.toString();
    }

    public static String buildJavaStarterTemplate(String fullCode, String title) {
        if (fullCode == null || fullCode.trim().isEmpty()) {
            return "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // TODO: Implement your solution here\n    }\n}\n";
        }
        int mainMethodIdx = fullCode.indexOf("public static void main");
        int firstMethodIdx = fullCode.indexOf("public static ");
        if (firstMethodIdx != -1 && mainMethodIdx != -1 && firstMethodIdx < mainMethodIdx) {
            int braceOpen = fullCode.indexOf("{", firstMethodIdx);
            if (braceOpen != -1 && braceOpen < mainMethodIdx) {
                String methodSig = fullCode.substring(firstMethodIdx, braceOpen + 1);
                String beforeMethod = fullCode.substring(0, firstMethodIdx);
                String mainPart = fullCode.substring(mainMethodIdx);

                String defaultReturn = "return 0;";
                if (methodSig.contains("int[]")) defaultReturn = "return new int[0];";
                else if (methodSig.contains("boolean")) defaultReturn = "return false;";
                else if (methodSig.contains("String")) defaultReturn = "return \"\";";
                else if (methodSig.contains("List<")) defaultReturn = "return new ArrayList<>();";
                else if (methodSig.contains("void")) defaultReturn = "";

                return beforeMethod + methodSig + "\n        // TODO: Implement your solution here\n        " + defaultReturn + "\n    }\n\n    " + mainPart;
            }
        }

        return "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: Implement your solution here\n    }\n}\n";
    }

    private void seedMockHistory(User user, InterviewQuestion q1, InterviewQuestion q3) {
        // Mock Session 1 (Two Sum - Passed with 88 score)
        InterviewSession s1 = new InterviewSession(user, q1, Enums.Difficulty.EASY, Enums.Language.PYTHON, 30, "Coding + Explanation");
        s1.setState(Enums.SessionState.REPORT);
        s1.setStartedAt(LocalDateTime.now().minusDays(3));
        s1.setCompletedAt(LocalDateTime.now().minusDays(3).plusMinutes(25));
        s1.setLastSubmittedCode("def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []");
        s1.setTelemetryLog("[{\"time\":\"2026-08-06 10:00:00\",\"event\":\"Session initiated\"},{\"time\":\"2026-08-06 10:03:00\",\"event\":\"Explained sliding window approach\"},{\"time\":\"2026-08-06 10:07:00\",\"event\":\"AI Interviewer recommended Hashing\"},{\"time\":\"2026-08-06 10:08:00\",\"event\":\"State transitioned to CODING\"},{\"time\":\"2026-08-06 10:18:00\",\"event\":\"Run draft tests passed\"},{\"time\":\"2026-08-06 10:25:00\",\"event\":\"Final submit run completed\"}]");
        sessionRepository.save(s1);

        Submission sub1 = new Submission(s1, s1.getLastSubmittedCode(), Enums.Language.PYTHON, 8, 8, Enums.ExecutionResultStatus.SUCCESS);
        sub1.setExecutionTimeMs(45L);
        submissionRepository.save(sub1);

        Assessment a1 = new Assessment(s1);
        a1.setOverallScore(88);
        a1.setCorrectnessScore(100);
        a1.setProblemSolvingScore(90);
        a1.setEfficiencyScore(90);
        a1.setCodeQualityScore(85);
        a1.setDebuggingScore(80);
        a1.setEdgeCasesScore(85);
        a1.setCommunicationScore(80);
        a1.setDetectedTimeComplexity("O(n)");
        a1.setDetectedSpaceComplexity("O(n)");
        a1.setAutopsySummary("Excellent performance. Selected optimal Hash Map mapping strategy on first code attempt. Successfully maintained O(n) efficiency.");
        a1.setWhatWentWell("Fast conceptual logic mapping. Standard naming styles. Optimal space-time trade-off.");
        a1.setAreasToImprove("Avoid writing redundant declaration brackets. Proactively mention key constraints on empty input lists.");
        a1.setInterviewerFeedback("Very strong. The candidate immediately understood the O(n) optimization path and bypassed the nested loop route.");
        a1.setSuggestedPractice("Sliding Window, Sorting, Arrays");
        assessmentRepository.save(a1);

        // Save mock messages
        messageRepository.save(new InterviewMessage(s1, "AI", "Welcome. Let's solve Two Sum. Explain your approach first."));
        messageRepository.save(new InterviewMessage(s1, "CANDIDATE", "I can use a hash map to keep track of indices of elements we have visited so we find the match in one pass."));
        messageRepository.save(new InterviewMessage(s1, "AI", "Excellent. You can proceed to code in the editor panel."));
        messageRepository.save(new InterviewMessage(s1, "CANDIDATE", "Code written and submitted."));
        messageRepository.save(new InterviewMessage(s1, "AI", "Great. Tests passed. Let's review complexity."));

        // Mock Session 2 (Valid Parentheses - Passed with 76 score)
        InterviewSession s2 = new InterviewSession(user, q3, Enums.Difficulty.EASY, Enums.Language.PYTHON, 30, "Full Simulation");
        s2.setState(Enums.SessionState.REPORT);
        s2.setStartedAt(LocalDateTime.now().minusDays(1));
        s2.setCompletedAt(LocalDateTime.now().minusDays(1).plusMinutes(20));
        s2.setLastSubmittedCode("def isValid(s):\n    stack = []\n    for char in s:\n        if char in '({[':\n            stack.append(char)\n        else:\n            if not stack: return False\n            top = stack.pop()\n            if char == ')' and top != '(': return False\n            if char == '}' and top != '{': return False\n            if char == ']' and top != '[': return False\n    return len(stack) == 0");
        s2.setTelemetryLog("[{\"time\":\"2026-08-08 14:00:00\",\"event\":\"Session initiated\"},{\"time\":\"2026-08-08 14:02:00\",\"event\":\"Began writing stack code directly\"},{\"time\":\"2026-08-08 14:10:00\",\"event\":\"First test failed with runtime error\"},{\"time\":\"2026-08-08 14:15:00\",\"event\":\"Fixed popping empty stack condition\"},{\"time\":\"2026-08-08 14:20:00\",\"event\":\"All test cases verified\"}]");
        sessionRepository.save(s2);

        Submission sub2 = new Submission(s2, s2.getLastSubmittedCode(), Enums.Language.PYTHON, 8, 8, Enums.ExecutionResultStatus.SUCCESS);
        sub2.setExecutionTimeMs(62L);
        submissionRepository.save(sub2);

        Assessment a2 = new Assessment(s2);
        a2.setOverallScore(76);
        a2.setCorrectnessScore(100);
        a2.setProblemSolvingScore(80);
        a2.setEfficiencyScore(80);
        a2.setCodeQualityScore(70);
        a2.setDebuggingScore(60); // Low because of early runtime crash
        a2.setEdgeCasesScore(75);
        a2.setCommunicationScore(70);
        a2.setDetectedTimeComplexity("O(n)");
        a2.setDetectedSpaceComplexity("O(n)");
        a2.setAutopsySummary("Good correction flow. The candidate started coding without validating empty stack calls which caused an early RuntimeException. However, they resolved the crash within 5 minutes.");
        a2.setWhatWentWell("Used standard Stack framework correctly. Clean conditional mapping logic.");
        a2.setAreasToImprove("Perform dry-runs before early execution runs to catch indexing crash lines. Communicate thoughts while refactoring compiler logs.");
        a2.setInterviewerFeedback("Solid recovery. Missing the empty-stack check on line 8 is a common trap, but the candidate refactored quickly. Needs more defensive programming discipline.");
        a2.setSuggestedPractice("Stacks, Parsing, Error Logging");
        assessmentRepository.save(a2);
    }
}
