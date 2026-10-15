const http = require('http');

const PORT = 8080;

function generateAiInterviewerReply(rawInput) {
  let text = String(rawInput || '').toLowerCase().trim();

  // If rawInput was a JSON object string or wrapped content
  if (text.includes("content")) {
    const match = text.match(/content["']?\s*[:=]\s*["']?([^"'}]+)/);
    if (match && match[1]) text = match[1].toLowerCase().trim();
  }

  // 1. Educational & Concept Questions
  if (text.includes("what is an array") || text.includes("what is array") || text.includes("array")) {
    return "An array is a linear data structure that stores elements in contiguous memory locations. It allows O(1) index-based access, but insertion and deletion take O(N) time when shifting elements. In Two Sum, we can iterate through the array in a single scan while storing complement values in a Hash Map.";
  }
  if (text.includes("what is a hashmap") || text.includes("what is hash map") || text.includes("hashmap") || text.includes("hashing")) {
    return "A Hash Map is a key-value data structure providing average O(1) time complexity for insertions, deletions, and lookups using a hash function. In Two Sum, we map each array value to its index to find target complements instantaneously.";
  }
  if (text.includes("what is big o") || text.includes("time complexity") || text.includes("space complexity") || text.includes("complexity")) {
    return "Big-O notation describes the upper bound of an algorithm's asymptotic runtime or space footprint. For Two Sum, brute-force nested loops yield O(N^2) time complexity, whereas the Hash Map approach reduces time complexity to O(N) at the cost of O(N) auxiliary memory space.";
  }
  if (text.includes("stack") || text.includes("queue")) {
    return "A Stack is a LIFO (Last-In, First-Out) data structure, whereas a Queue is a FIFO (First-In, First-Out) data structure. Stacks are ideal for matching nested delimiters, balancing parentheses, and depth-first search (DFS) traversals.";
  }

  // 2. Greetings & Introductions
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("greetings")) {
    return "Hello! I am your KODEXIS AI Technical Interviewer. I am ready to evaluate your problem-solving skills. Before you begin writing code in the editor, please state your conceptual approach for solving Two Sum.";
  }

  // 3. Technical Approaches & Data Structures
  if (text.includes("two pointer") || text.includes("sliding window")) {
    return "Two pointers works exceptionally well for sorted input arrays, allowing O(N) traversal with O(1) space. However, if the input array is un-sorted, sorting first would require O(N log N) time. How do you plan to handle unsorted inputs?";
  }
  if (text.includes("sort") || text.includes("sorting")) {
    return "Sorting the input array takes O(N log N) time complexity. Can we optimize this further to achieve a linear O(N) time bound using a Hash Map?";
  }
  if (text.includes("brute force") || text.includes("nested loop")) {
    return "A brute-force approach compares all pairs using two nested loops, taking O(N^2) time. While correct, it may exceed the time limit on large inputs. Can you think of a data structure that lowers the lookup cost to O(1)?";
  }
  if (text.includes("edge case") || text.includes("null") || text.includes("empty")) {
    return "Defensive programming is crucial! Always handle edge cases such as empty input arrays, arrays with fewer than two elements, duplicate target values, and negative integers early in your solution.";
  }

  // 4. Hints & Help
  if (text.includes("hint") || text.includes("help") || text.includes("stuck")) {
    return "Here is a hint: As you iterate through the array with index `i`, compute the complement `target - nums[i]`. Check if that complement is already present in your Hash Map. If it is, return `[map.get(complement), i]`. Otherwise, insert `map.put(nums[i], i)`. Try implementing this in the editor!";
  }

  // 5. Default Fallback
  return "That is a valid engineering perspective. Before writing code in the editor, ensure you have considered the time complexity trade-offs and edge cases for your approach.";
}

// In-memory Database Store
const database = {
  users: [
    {
      username: 'candidate',
      password: 'password123',
      fullName: 'Candidate',
      role: 'ROLE_CANDIDATE',
      targetRole: 'Software Engineer',
      targetCompanies: 'Top Tech Companies',
      experienceLevel: 'MEDIUM',
      preferredLanguage: 'PYTHON',
      readinessScore: 85,
      isOnboarded: true
    }
  ],
  questions: [
    {
      id: 1,
      title: 'Two Sum - Hash Map Lookup',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
      difficulty: 'EASY',
      topic: 'Arrays / Hashing',
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(n)',
      optimalSolutionConcept: 'Use a Hash Map to look up complement values in O(1) time.',
      javaTemplate: 'public class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[0];\n    }\n}',
      pythonTemplate: 'def twoSum(nums, target):\n    # Your code here\n    return []',
      javascriptTemplate: 'function twoSum(nums, target) {\n    return [];\n}',
      testCases: [
        { id: 1, input: '2,7,11,15\n9', expectedOutput: '0,1', isHidden: false },
        { id: 2, input: '3,2,4\n6', expectedOutput: '1,2', isHidden: true }
      ]
    }
  ],
  sessions: {
    '1': {
      id: 1,
      question: {
        title: 'Two Sum - Hash Map Lookup',
        topic: 'Arrays / Hashing',
        expectedTimeComplexity: 'O(n)',
        expectedSpaceComplexity: 'O(n)'
      },
      language: 'JAVA',
      difficulty: 'EASY',
      state: 'DISCUSSION',
      startedAt: '2026-08-09T13:00:00',
      completedAt: '2026-08-09T13:25:00',
      lastSubmittedCode: `public class TwoSum {\n    public int[] solveTwoSum(int[] nums, int target) {\n        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
      telemetryLog: JSON.stringify([
        { time: '2026-08-09 13:05:00', event: 'Session initiated' }
      ])
    },
    '101': {
      id: 101,
      question: {
        title: 'Two Sum - Hash Map Lookup',
        topic: 'Arrays / Hashing',
        expectedTimeComplexity: 'O(n)',
        expectedSpaceComplexity: 'O(n)'
      },
      language: 'JAVA',
      difficulty: 'EASY',
      state: 'DISCUSSION',
      startedAt: '2026-08-09T13:00:00',
      completedAt: '2026-08-09T13:25:00',
      lastSubmittedCode: `public class TwoSum {\n    public int[] solveTwoSum(int[] nums, int target) {\n        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
      telemetryLog: JSON.stringify([
        { time: '2026-08-09 13:05:00', event: 'Session initiated' }
      ])
    }
  },
  assessments: {
    '101': {
      overallScore: 96,
      correctnessScore: 100,
      problemSolvingScore: 95,
      efficiencyScore: 95,
      codeQualityScore: 92,
      debuggingScore: 90,
      edgeCasesScore: 95,
      communicationScore: 88,
      detectedTimeComplexity: 'O(n)',
      detectedSpaceComplexity: 'O(n)',
      autopsySummary: 'Exceptional solution! The algorithm achieves optimal O(N) time complexity using a HashMap lookup strategy, passing 100% of functional test cases with high readability.',
      whatWentWell: 'Used HashMap to achieve single-pass O(N) time efficiency. Proper camelCase naming and modular structure.',
      areasToImprove: 'Consider pre-sizing initial map capacity when input array length is known.',
      interviewerFeedback: 'Outstanding performance. Bypassed brute-force nested loops and wrote clean modular code.',
      suggestedPractice: 'Sliding Window, Two Pointers, HashMap Load Factor'
    }
  }
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = req.url;
  const method = req.method;

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    let parsedBody = {};
    try { if (body) parsedBody = JSON.parse(body); } catch (e) {}

    console.log(`[KODEXIS Backend] ${method} ${url}`);

    // --- AUTH ROUTES ---
    if (url === '/api/auth/login' && method === 'POST') {
      const user = database.users[0];
      return sendJson(res, 200, {
        token: 'kodexis_jwt_session_token_9982',
        ...user
      });
    }

    if (url === '/api/auth/register' && method === 'POST') {
      const newUser = {
        username: parsedBody.username || 'vicky',
        role: 'ROLE_CANDIDATE',
        fullName: parsedBody.fullName || 'Vigneshwaran S P',
        targetRole: 'Software Engineer',
        targetCompanies: 'NVIDIA, Google, Meta',
        experienceLevel: 'MEDIUM',
        preferredLanguage: 'PYTHON',
        readinessScore: 88,
        isOnboarded: true
      };
      return sendJson(res, 200, {
        token: 'kodexis_jwt_session_token_9982',
        ...newUser
      });
    }

    if (url === '/api/auth/me' && method === 'GET') {
      return sendJson(res, 200, database.users[0]);
    }

    if (url === '/api/auth/onboard' && method === 'POST') {
      Object.assign(database.users[0], parsedBody, { isOnboarded: true });
      return sendJson(res, 200, { message: 'Onboarding completed successfully' });
    }

    // --- PROGRESS & DASHBOARD ROUTES ---
    if (url === '/api/progress/dashboard' && method === 'GET') {
      return sendJson(res, 200, {
        fullName: database.users[0].fullName,
        targetRole: database.users[0].targetRole,
        targetCompanies: database.users[0].targetCompanies,
        experienceLevel: database.users[0].experienceLevel,
        preferredLanguage: database.users[0].preferredLanguage,
        readinessScore: database.users[0].readinessScore,
        skills: {
          'Arrays': 'EXPERT',
          'Strings': 'STRONG',
          'Hashing': 'EXPERT',
          'Linked Lists': 'INTERMEDIATE',
          'Stacks & Queues': 'STRONG',
          'Trees': 'DEVELOPING',
          'Graphs': 'WEAK',
          'Recursion': 'INTERMEDIATE',
          'Dynamic Programming': 'DEVELOPING',
          'Greedy Algorithms': 'INTERMEDIATE',
          'Backtracking': 'DEVELOPING',
          'Sorting & Searching': 'STRONG',
          'System Design': 'STRONG'
        },
        history: [
          {
            sessionId: 101,
            topic: 'Arrays / Hashing',
            title: 'Two Sum - Hash Map Lookup',
            difficulty: 'EASY',
            language: 'JAVA',
            score: 96,
            date: '2026-08-09T13:25:00'
          }
        ],
        weaknesses: [
          {
            topic: 'Graph Algorithms (BFS/DFS)',
            status: 'Critical Weakness',
            description: 'Traversals on directional graph cycles need additional practice.'
          },
          {
            topic: 'Edge Case Validation',
            status: 'Attention Required',
            description: 'Practice checking empty/boundary inputs prior to submission.'
          }
        ]
      });
    }

    // --- ADMIN QUESTIONS ENDPOINTS ---
    if (url === '/api/admin/questions' && method === 'GET') {
      return sendJson(res, 200, database.questions);
    }

    if (url === '/api/admin/questions' && method === 'POST') {
      const newQ = { id: Date.now(), ...parsedBody };
      database.questions.push(newQ);
      return sendJson(res, 200, newQ);
    }

    if (url.startsWith('/api/admin/questions/') && method === 'PUT') {
      const qid = parseInt(url.split('/')[4]);
      const idx = database.questions.findIndex(q => q.id === qid);
      if (idx !== -1) {
        database.questions[idx] = { ...database.questions[idx], ...parsedBody };
        return sendJson(res, 200, database.questions[idx]);
      }
      return sendJson(res, 200, { message: 'Updated' });
    }

    if (url.startsWith('/api/admin/questions/') && method === 'DELETE') {
      const qid = parseInt(url.split('/')[4]);
      database.questions = database.questions.filter(q => q.id !== qid);
      return sendJson(res, 200, { message: 'Deleted' });
    }

    // --- CREATE NEW SESSION ---
    if (url === '/api/interviews' && method === 'POST') {
      const newSession = {
        id: 101,
        question: {
          title: 'Two Sum - Hash Map Lookup',
          topic: 'Arrays / Hashing',
          expectedTimeComplexity: 'O(n)',
          expectedSpaceComplexity: 'O(n)'
        },
        language: parsedBody.language || 'JAVA',
        difficulty: parsedBody.difficulty || 'EASY',
        state: 'DISCUSSION',
        startedAt: new Date().toISOString(),
        completedAt: null,
        lastSubmittedCode: `public class TwoSum {\n    public int[] solveTwoSum(int[] nums, int target) {\n        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
        telemetryLog: JSON.stringify([
          { time: new Date().toISOString(), event: 'Session initiated' }
        ])
      };
      return sendJson(res, 200, newSession);
    }

    // --- GET SESSION BY ID & MESSAGES / ASSESSMENT ---
    if (url.startsWith('/api/interviews/')) {
      const cleanPath = url.replace('/api/interviews/', '');
      const parts = cleanPath.split('/');
      const id = parts[0] && parts[0] !== 'undefined' ? parts[0] : '101';
      const sub = parts[1];

      if (sub === 'messages') {
        return sendJson(res, 200, [
          { id: 1, sender: 'AI_INTERVIEWER', content: 'Welcome to your KODEXIS Technical Interview! Before writing code in the editor, please explain your initial approach for solving the problem.', timestamp: new Date().toISOString() }
        ]);
      }

      if (sub === 'message' && method === 'POST') {
        const rawContent = parsedBody.content || body || '';
        const aiResponseContent = generateAiInterviewerReply(rawContent);
        return sendJson(res, 200, {
          id: Date.now(),
          sender: 'AI_INTERVIEWER',
          content: aiResponseContent,
          timestamp: new Date().toISOString()
        });
      }

      if (sub === 'run' && method === 'POST') {
        return sendJson(res, 200, {
          status: 'SUCCESS',
          passedCases: 18,
          totalCases: 18,
          executionTimeMs: 14,
          memoryUsedKb: 3420,
          consoleOutput: 'Test Case 1: [2, 7, 11, 15], target = 9 -> Output: [0, 1] (PASSED)\nTest Case 2: [3, 2, 4], target = 6 -> Output: [1, 2] (PASSED)\nTest Case 3: [3, 3], target = 6 -> Output: [0, 1] (PASSED)\nAll 18 functional & hidden edge cases passed.',
          details: [
            { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]', actualOutput: '[0, 1]', status: 'PASSED', executionTimeMs: 2 },
            { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]', actualOutput: '[1, 2]', status: 'PASSED', executionTimeMs: 1 }
          ]
        });
      }

      if (sub === 'assessment') {
        const assessment = database.assessments[id] || database.assessments['101'];
        return sendJson(res, 200, assessment);
      }

      const session = database.sessions[id] || database.sessions['101'];
      return sendJson(res, 200, session);
    }

    // Default Fallback
    return sendJson(res, 200, { message: 'KODEXIS HR-AI Backend Active' });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 KODEXIS HR-AI BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`   Health Check API: http://localhost:${PORT}/api/auth/me`);
  console.log(`   Assessment Dashboard: http://localhost:${PORT}/api/progress/dashboard`);
  console.log(`=======================================================`);
});
