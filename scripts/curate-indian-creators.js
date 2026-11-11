const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "../src/lib/student/skills-catalog.ts");
const content = fs.readFileSync(catalogPath, "utf8");

const startMarker = "= [";
const start = content.indexOf(startMarker) + 2; // points directly to '['
const endMarker = "];\n\nexport function getSkillById";
const end = content.indexOf(endMarker, start); // points to ']'

if (start === -1 || end === -1) {
  console.error("Could not find start or end marker in skills-catalog.ts");
  process.exit(1);
}

const jsonStr = content.substring(start, end + 1);
const catalog = JSON.parse(jsonStr);

// Comprehensive Indian Creator & International Fallback Lesson Curations
const CURATED_SKILL_LESSONS = {
  // 1. PYTHON (CodeWithHarry, CampusX, Krish Naik, Apna College)
  python: [
    {
      id: "py-01",
      title: "Python Introduction & Setup in Hindi",
      durationMinutes: 45,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/7wnove7K-ZQ",
      youtubeUrl: "https://www.youtube.com/watch?v=7wnove7K-ZQ",
      videoTitle: "Python Tutorial for Beginners in Hindi | Complete Python Course",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/tutorial/appetite.html",
      summary: "Install Python 3, configure VS Code with Python extensions, and write your first Hello World script."
    },
    {
      id: "py-02",
      title: "Variables, Data Types & Type Casting",
      durationMinutes: 32,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/ORCuz7s5cCY",
      youtubeUrl: "https://www.youtube.com/watch?v=ORCuz7s5cCY",
      videoTitle: "Variables and Data Types in Python | Python Tutorial in Hindi",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/tutorial/introduction.html#numbers",
      summary: "Master integers, floats, booleans, strings, and explicit typecasting with hands-on console examples."
    },
    {
      id: "py-03",
      title: "Operators, Expressions & Precedence",
      durationMinutes: 28,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/nL6rK4JcQoc",
      youtubeUrl: "https://www.youtube.com/watch?v=nL6rK4JcQoc",
      videoTitle: "Operators in Python | Python Course in Hindi",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/library/operator.html",
      summary: "Arithmetic, comparison, logical, bitwise, assignment, and identity operators in Python."
    },
    {
      id: "py-04",
      title: "Conditional Statements (if / elif / else)",
      durationMinutes: 30,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/A8n48y76p48",
      youtubeUrl: "https://www.youtube.com/watch?v=A8n48y76p48",
      videoTitle: "If Else Conditionals in Python | Python Tutorial in Hindi",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/tutorial/controlflow.html#if-statements",
      summary: "Control flow branching, nested if statements, and short-circuit evaluation."
    },
    {
      id: "py-05",
      title: "Loops: for, while & Iterators",
      durationMinutes: 36,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/0Ds3wY6l5B4",
      youtubeUrl: "https://www.youtube.com/watch?v=0Ds3wY6l5B4",
      videoTitle: "For and While Loops in Python | Python Course in Hindi",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/tutorial/controlflow.html#for-statements",
      summary: "Iterating ranges and collections with for loops, while loops, break, continue, and loop-else."
    },
    {
      id: "py-06",
      title: "Functions, Parameters, *args & **kwargs",
      durationMinutes: 34,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/d3Uu7K5V1kI",
      youtubeUrl: "https://www.youtube.com/watch?v=d3Uu7K5V1kI",
      videoTitle: "Functions in Python | Python Tutorial in Hindi",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
      summary: "Defining modular functions, default parameters, variable-length positional and keyword arguments."
    },
    {
      id: "py-07",
      title: "Data Structures: Lists, Tuples, Sets & Dictionaries",
      durationMinutes: 42,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/W8KRzm-HUcc",
      youtubeUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
      videoTitle: "Python Lists, Tuples & Dictionaries in Hindi",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/tutorial/datastructures.html",
      summary: "Deep dive into mutable vs immutable collections, hashing, comprehensions, and dictionary methods."
    },
    {
      id: "py-08",
      title: "Object-Oriented Programming (OOP) in Python",
      durationMinutes: 55,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/o0bUptvfEIs",
      youtubeUrl: "https://www.youtube.com/watch?v=o0bUptvfEIs",
      videoTitle: "Object Oriented Programming in Python (OOPs) in Hindi",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Code: Python in Hindi",
      docUrl: "https://docs.python.org/3/tutorial/classes.html",
      summary: "Classes, objects, constructors (__init__), instance vs class variables, encapsulation, and inheritance."
    },
    {
      id: "py-09",
      title: "Practical Python Project: Complete Game / App",
      durationMinutes: 45,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/aqvDTCpNRek",
      youtubeUrl: "https://www.youtube.com/watch?v=aqvDTCpNRek",
      videoTitle: "Snake Water Gun Game / Mega Project in Python",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Python Mega Projects Series",
      docUrl: "https://docs.python.org/3/tutorial/",
      summary: "Build an end-to-end interactive terminal application applying control flow, random modules, and OOP structure."
    }
  ],

  // 2. JAVASCRIPT (Chai aur Code, CodeWithHarry)
  javascript: [
    {
      id: "js-01",
      title: "JavaScript Foundations & Execution Context",
      durationMinutes: 45,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/sscX432bMZo",
      youtubeUrl: "https://www.youtube.com/watch?v=sscX432bMZo",
      videoTitle: "Chai aur JavaScript | Complete Course in Hindi",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur JavaScript Series",
      docUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction",
      summary: "Understand the V8 engine, Call Stack, Global Execution Context, and how JavaScript executes code."
    },
    {
      id: "js-02",
      title: "Datatypes, Variables & Memory Management",
      durationMinutes: 38,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/suPrs_hflzU",
      youtubeUrl: "https://www.youtube.com/watch?v=suPrs_hflzU",
      videoTitle: "Datatypes & Stack vs Heap Memory in JavaScript",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur JavaScript Series",
      docUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures",
      summary: "Primitives vs Reference types, Stack memory allocation vs Heap storage, and string interpolation."
    },
    {
      id: "js-03",
      title: "Functions, Scope & Hoisting in JavaScript",
      durationMinutes: 42,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/eunhAaACmsE",
      youtubeUrl: "https://www.youtube.com/watch?v=eunhAaACmsE",
      videoTitle: "Functions, Scope & Hoisting in JavaScript",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur JavaScript Series",
      docUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
      summary: "Function declarations, expressions, arrow functions, lexical scoping, closure mechanisms, and this keyword."
    },
    {
      id: "js-04",
      title: "DOM Manipulation & Node Selectors",
      durationMinutes: 35,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/13gLB6hDHR8",
      youtubeUrl: "https://www.youtube.com/watch?v=13gLB6hDHR8",
      videoTitle: "DOM Selectors, Nodes & Manipulation in JS",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur JavaScript Series",
      docUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
      summary: "getElementById, querySelector, navigating HTMLCollections, dynamically creating elements, and event listeners."
    },
    {
      id: "js-05",
      title: "Async JavaScript, Promises & Event Loop",
      durationMinutes: 50,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/_TjtAyMkiTI",
      youtubeUrl: "https://www.youtube.com/watch?v=_TjtAyMkiTI",
      videoTitle: "Async JavaScript, Promises & Event Loop Explained",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur JavaScript Series",
      docUrl: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous",
      summary: "Asynchronous programming models, Microtask queue, Callback hell resolution, and Promise chaining."
    },
    {
      id: "js-06",
      title: "Fetch API, Async/Await & Modern ES6+",
      durationMinutes: 44,
      stage: "Advanced",
      videoUrl: "https://www.youtube-nocookie.com/embed/R93ce4zOSG8",
      youtubeUrl: "https://www.youtube.com/watch?v=R93ce4zOSG8",
      videoTitle: "Fetch API, Async/Await & Error Handling",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur JavaScript Series",
      docUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
      summary: "Consuming REST APIs, try/catch error handling, headers, payload serialization, and async/await syntax."
    }
  ],

  // 3. REACT (Chai aur Code, Apna College)
  react: [
    {
      id: "react-01",
      title: "React JS Core Architecture & Virtual DOM",
      durationMinutes: 52,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/vz1RlUyrc3w",
      youtubeUrl: "https://www.youtube.com/watch?v=vz1RlUyrc3w",
      videoTitle: "Chai aur React | React JS Complete Course in Hindi",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur React Series",
      docUrl: "https://react.dev/learn",
      summary: "Component tree architecture, JSX compilation via Babel, reconciliation algorithm, and Vite tooling setup."
    },
    {
      id: "react-02",
      title: "React Hooks in Depth (useState & useEffect)",
      durationMinutes: 40,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/lI_A_u2RkF0",
      youtubeUrl: "https://www.youtube.com/watch?v=lI_A_u2RkF0",
      videoTitle: "React Hooks in Depth (useState & useEffect)",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur React Series",
      docUrl: "https://react.dev/reference/react/useState",
      summary: "State management lifecycles, dependency arrays in useEffect, clean-up functions, and avoiding infinite re-renders."
    },
    {
      id: "react-03",
      title: "Tailwind CSS & Props Passing in React",
      durationMinutes: 36,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/1Xb0nN2zQ34",
      youtubeUrl: "https://www.youtube.com/watch?v=1Xb0nN2zQ34",
      videoTitle: "Tailwind CSS & Props Passing in React",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur React Series",
      docUrl: "https://react.dev/learn/passing-props-to-a-component",
      summary: "Reusable component design with prop destructuring, children props, default values, and Tailwind utility styling."
    },
    {
      id: "react-04",
      title: "Custom Hooks & Real-World Currency App",
      durationMinutes: 45,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/F4q_VvQv_4U",
      youtubeUrl: "https://www.youtube.com/watch?v=F4q_VvQv_4U",
      videoTitle: "Custom Hooks & Currency Converter Project in React",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur React Series",
      docUrl: "https://react.dev/learn/reusing-logic-with-custom-hooks",
      summary: "Extracting shared stateful logic into clean reusable custom hooks with API fetching and cache optimization."
    },
    {
      id: "react-05",
      title: "Context API & Redux Toolkit (RTK) Masterclass",
      durationMinutes: 48,
      stage: "Advanced",
      videoUrl: "https://www.youtube-nocookie.com/embed/1i04-A7khFI",
      youtubeUrl: "https://www.youtube.com/watch?v=1i04-A7khFI",
      videoTitle: "Redux Toolkit (RTK) Complete Masterclass in Hindi",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur React Series",
      docUrl: "https://redux-toolkit.js.org/",
      summary: "Global state management without prop drilling, slices, reducers, configureStore, and useSelector/useDispatch."
    }
  ],

  // 4. DATA STRUCTURES & ALGORITHMS (takeUforward / Striver, Love Babbar, Apna College)
  "data-structures-algorithms": [
    {
      id: "dsa-01",
      title: "DSA Roadmap & Time & Space Complexity",
      durationMinutes: 45,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/0bHoB3568Eg",
      youtubeUrl: "https://www.youtube.com/watch?v=0bHoB3568Eg",
      videoTitle: "Complete A2Z DSA Course | Time & Space Complexity Analysis",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver A2Z DSA Sheet Series",
      docUrl: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
      summary: "Big O, Omega, Theta notation, calculating worst-case/average-case complexities, and structuring an interview study plan."
    },
    {
      id: "dsa-02",
      title: "Arrays Easy to Hard & Kadane's Algorithm",
      durationMinutes: 55,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/w_DETXuSc9A",
      youtubeUrl: "https://www.youtube.com/watch?v=w_DETXuSc9A",
      videoTitle: "Arrays Easy to Hard | Kadane's Algorithm & Subarrays",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver A2Z DSA Sheet Series",
      docUrl: "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/",
      summary: "Two pointer techniques, sliding windows, Dutch National Flag algorithm, and maximum subarray sum."
    },
    {
      id: "dsa-03",
      title: "Binary Search Mastery on 1D, 2D Arrays & Answer Space",
      durationMinutes: 48,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/j7NodO9HIbk",
      youtubeUrl: "https://www.youtube.com/watch?v=j7NodO9HIbk",
      videoTitle: "Binary Search Complete Series | takeUforward",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver A2Z DSA Sheet Series",
      docUrl: "https://takeuforward.org/binary-search/binary-search-explained/",
      summary: "Lower bound, upper bound, rotated sorted arrays, and binary search on monotonic answer spaces."
    },
    {
      id: "dsa-04",
      title: "Linked Lists: Singly, Doubly & Cycle Detection",
      durationMinutes: 50,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/Nq7ok-OyEpg",
      youtubeUrl: "https://www.youtube.com/watch?v=Nq7ok-OyEpg",
      videoTitle: "Linked List Interview Problems & Cycle Detection",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver A2Z DSA Sheet Series",
      docUrl: "https://takeuforward.org/data-structure/detect-a-cycle-in-a-linked-list/",
      summary: "Pointer manipulations, reversal, middle of list, Floyd's Tortoise & Hare algorithm, and merging sorted lists."
    },
    {
      id: "dsa-05",
      title: "Binary Trees & Traversals (Inorder, Preorder, Level Order)",
      durationMinutes: 52,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/jmy0LaGET1I",
      youtubeUrl: "https://www.youtube.com/watch?v=jmy0LaGET1I",
      videoTitle: "Binary Tree Traversals (Inorder, Preorder, Level Order)",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver A2Z DSA Sheet Series",
      docUrl: "https://takeuforward.org/data-structure/level-order-traversal-of-a-binary-tree/",
      summary: "Recursive vs iterative tree traversals, height, diameter, maximum path sum, and vertical order views."
    },
    {
      id: "dsa-06",
      title: "Graphs: BFS, DFS, Cycle Detection & Dijkstra's Algorithm",
      durationMinutes: 58,
      stage: "Advanced",
      videoUrl: "https://www.youtube-nocookie.com/embed/V6H3qAbHzkU",
      youtubeUrl: "https://www.youtube.com/watch?v=V6H3qAbHzkU",
      videoTitle: "Graph Series | BFS, DFS, Cycle Detection & Shortest Path",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver A2Z DSA Sheet Series",
      docUrl: "https://takeuforward.org/graph/dijkstras-algorithm-using-priority-queue-g-32/",
      summary: "Adjacency representations, topological sort (Kahn's), Prim's, Kruskal's, and shortest path algorithms."
    },
    {
      id: "dsa-07",
      title: "Dynamic Programming: 1D, 2D, Grids & Knapsack Patterns",
      durationMinutes: 60,
      stage: "Advanced",
      videoUrl: "https://www.youtube-nocookie.com/embed/tyB0ztf0DNY",
      youtubeUrl: "https://www.youtube.com/watch?v=tyB0ztf0DNY",
      videoTitle: "Dynamic Programming Series | Tabulation & Memoization",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver A2Z DSA Sheet Series",
      docUrl: "https://takeuforward.org/data-structure/dynamic-programming-introduction/",
      summary: "Overlapping subproblems, optimal substructure, state transitions, memoization to tabulation space optimization."
    }
  ],

  // 5. C++ (Love Babbar, Apna College, CodeWithHarry)
  cpp: [
    {
      id: "cpp-01",
      title: "C++ Basics, Flowcharts & Setup",
      durationMinutes: 45,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/WQoB2z67hvY",
      youtubeUrl: "https://www.youtube.com/watch?v=WQoB2z67hvY",
      videoTitle: "C++ Basics & Flowcharts | Supreme Batch",
      instructor: "Love Babbar",
      channelName: "Love Babbar",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "C++ & DSA Supreme Batch",
      docUrl: "https://en.cppreference.com/w/cpp/language/basic_concepts",
      summary: "Setting up GCC/Clang, writing first C++ program, streams (cin/cout), and basic syntax rules."
    },
    {
      id: "cpp-02",
      title: "C++ Complete Full Course | Apna College",
      durationMinutes: 60,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/EAR7De6Goz4",
      youtubeUrl: "https://www.youtube.com/watch?v=EAR7De6Goz4",
      videoTitle: "C++ Full Course | Apna College",
      instructor: "Apna College",
      channelName: "Apna College",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Placement Series C++",
      docUrl: "https://www.learncpp.com/",
      summary: "Variables, conditions, loops, functions, arrays, and standard libraries for college placement."
    },
    {
      id: "cpp-03",
      title: "Object-Oriented Programming (OOP) in C++",
      durationMinutes: 58,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/bL-o2xBENY0",
      youtubeUrl: "https://www.youtube.com/watch?v=bL-o2xBENY0",
      videoTitle: "OOPs in C++ Complete Lecture | Love Babbar",
      instructor: "Love Babbar",
      channelName: "Love Babbar",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "C++ & DSA Supreme Batch",
      docUrl: "https://en.cppreference.com/w/cpp/language/classes",
      summary: "Pointers, dynamic memory allocation (new/delete), classes, constructors/destructors, virtual functions, and inheritance."
    }
  ],

  // 6. JAVA (Apna College, CodeWithHarry)
  java: [
    {
      id: "java-01",
      title: "Java Complete Placement Course in One Video",
      durationMinutes: 65,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/yRpLlJmRo2w",
      youtubeUrl: "https://www.youtube.com/watch?v=yRpLlJmRo2w",
      videoTitle: "Java Full Course | Placement Series",
      instructor: "Apna College",
      channelName: "Apna College",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Java Placement Course",
      docUrl: "https://docs.oracle.com/en/java/",
      summary: "JVM architecture, JDK/JRE, bytecode execution, variables, control statements, methods, and memory model."
    },
    {
      id: "java-02",
      title: "Java Tutorial for Beginners in Hindi",
      durationMinutes: 55,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/ntLJmHOJ0ME",
      youtubeUrl: "https://www.youtube.com/watch?v=ntLJmHOJ0ME",
      videoTitle: "Java Tutorial for Beginners in Hindi | Complete Course",
      instructor: "CodeWithHarry",
      channelName: "CodeWithHarry",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Java Programming in Hindi",
      docUrl: "https://dev.java/learn/",
      summary: "Object-oriented paradigms in Java, method overloading/overriding, abstract classes, interfaces, and packages."
    }
  ],

  // 7. C PROGRAMMING (Jenny's Lectures CS/IT, CodeWithHarry)
  c: [
    {
      id: "c-01",
      title: "C Programming & Data Structures Introduction",
      durationMinutes: 30,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/2ZLl8GAk1jx",
      youtubeUrl: "https://www.youtube.com/watch?v=2ZLl8GAk1jx",
      videoTitle: "Introduction to Data Structures in C",
      instructor: "Jenny's Lectures CS/IT",
      channelName: "Jenny's Lectures CS/IT",
      language: "English",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "C Programming & DSA in C",
      docUrl: "https://en.cppreference.com/w/c",
      summary: "Pointers, memory addressing, structs, arrays, and standard I/O library in C."
    },
    {
      id: "c-02",
      title: "Linked Lists Creation and Traversal in C",
      durationMinutes: 35,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/qauyX34kO3A",
      youtubeUrl: "https://www.youtube.com/watch?v=qauyX34kO3A",
      videoTitle: "Linked List Creation and Traversal in C",
      instructor: "Jenny's Lectures CS/IT",
      channelName: "Jenny's Lectures CS/IT",
      language: "English",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "C Programming & DSA in C",
      docUrl: "https://en.cppreference.com/w/c/memory",
      summary: "Dynamic memory allocation using malloc/calloc/free and struct node chaining in C."
    }
  ],

  // 8. MACHINE LEARNING (CampusX, Krish Naik)
  "machine-learning": [
    {
      id: "ml-01",
      title: "What is Machine Learning? (Day 1: 100 Days of ML)",
      durationMinutes: 35,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/i_LwzRVP7bg",
      youtubeUrl: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
      videoTitle: "Day 1: What is Machine Learning? | 100 Days of ML",
      instructor: "CampusX",
      channelName: "CampusX",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Machine Learning",
      docUrl: "https://scikit-learn.org/stable/tutorial/basic/tutorial.html",
      summary: "Foundations of AI/ML, difference between rules vs learning, supervised vs unsupervised, and industry workflow."
    },
    {
      id: "ml-02",
      title: "End to End Machine Learning Project Workflow",
      durationMinutes: 48,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/7r-e2f4VlJ4",
      youtubeUrl: "https://www.youtube.com/watch?v=7r-e2f4VlJ4",
      videoTitle: "End to End Machine Learning Project Workflow",
      instructor: "CampusX",
      channelName: "CampusX",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Machine Learning",
      docUrl: "https://scikit-learn.org/stable/modules/compose.html",
      summary: "Data cleaning, feature engineering, train-test splitting, model training, evaluation metrics, and deployment."
    },
    {
      id: "ml-03",
      title: "Linear Regression Mathematical Intuition & OLS",
      durationMinutes: 42,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/E5RzzGoAmHY",
      youtubeUrl: "https://www.youtube.com/watch?v=E5RzzGoAmHY",
      videoTitle: "Linear Regression Mathematics & Intuition",
      instructor: "CampusX",
      channelName: "CampusX",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Machine Learning",
      docUrl: "https://scikit-learn.org/stable/modules/linear_model.html",
      summary: "Ordinary Least Squares, slope/intercept formulas, cost function minimization, and R2 score."
    },
    {
      id: "ml-04",
      title: "Gradient Descent from Scratch (Batch, Mini-Batch & SGD)",
      durationMinutes: 45,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/sDv4f4s2SB8",
      youtubeUrl: "https://www.youtube.com/watch?v=sDv4f4s2SB8",
      videoTitle: "Batch, Mini-Batch & Stochastic Gradient Descent",
      instructor: "CampusX",
      channelName: "CampusX",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Machine Learning",
      docUrl: "https://scikit-learn.org/stable/modules/sgd.html",
      summary: "Derivatives, learning rate tuning, convergence diagnostics, and comparing gradient descent variants."
    },
    {
      id: "ml-05",
      title: "Logistic Regression & Classification Metrics",
      durationMinutes: 40,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/yIYKR4sgzI8",
      youtubeUrl: "https://www.youtube.com/watch?v=yIYKR4sgzI8",
      videoTitle: "Logistic Regression & Confusion Matrix Intuition",
      instructor: "CampusX",
      channelName: "CampusX",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Machine Learning",
      docUrl: "https://scikit-learn.org/stable/modules/model_evaluation.html",
      summary: "Sigmoid function, log loss, confusion matrix, precision, recall, F1-score, and ROC-AUC curve."
    },
    {
      id: "ml-06",
      title: "Decision Trees & Ensemble Learning (Random Forest)",
      durationMinutes: 52,
      stage: "Advanced",
      videoUrl: "https://www.youtube-nocookie.com/embed/ZVR2Way4nwQ",
      youtubeUrl: "https://www.youtube.com/watch?v=ZVR2Way4nwQ",
      videoTitle: "Decision Trees & Ensemble Learning (Random Forest)",
      instructor: "CampusX",
      channelName: "CampusX",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "100 Days of Machine Learning",
      docUrl: "https://scikit-learn.org/stable/modules/ensemble.html",
      summary: "Entropy, Information Gain, Gini impurity, bagging, out-of-bag error, and Random Forest hyperparameter tuning."
    }
  ],

  // 9. DEEP LEARNING (CampusX, Krish Naik)
  "deep-learning": [
    {
      id: "dl-01",
      title: "Artificial Neural Networks (ANN) & Perceptrons",
      durationMinutes: 46,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/tIeHLnjs5U8",
      youtubeUrl: "https://www.youtube.com/watch?v=tIeHLnjs5U8",
      videoTitle: "Introduction to Deep Learning & Perceptron",
      instructor: "CampusX",
      channelName: "CampusX",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Deep Learning Series in Hindi",
      docUrl: "https://www.tensorflow.org/tutorials",
      summary: "Biological vs artificial neurons, forward propagation, weights, biases, and activation functions (ReLU, Sigmoid, Softmax)."
    },
    {
      id: "dl-02",
      title: "Deep Learning with PyTorch & Neural Networks",
      durationMinutes: 55,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/412p1j_j2kY",
      youtubeUrl: "https://www.youtube.com/watch?v=412p1j_j2kY",
      videoTitle: "Deep Learning with PyTorch & Neural Networks",
      instructor: "Krish Naik",
      channelName: "Krish Naik",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Complete Deep Learning Series",
      docUrl: "https://pytorch.org/tutorials/",
      summary: "PyTorch tensors, autograd engine, building nn.Module architectures, loss calculation, and Adam optimizers."
    }
  ],

  // 10. GENERATIVE AI & LLMS (Krish Naik, CampusX)
  "generative-ai": [
    {
      id: "genai-01",
      title: "Generative AI Complete Course with LangChain",
      durationMinutes: 60,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/6i3EQPmrG_g",
      youtubeUrl: "https://www.youtube.com/watch?v=6i3EQPmrG_g",
      videoTitle: "Generative AI Course with LangChain & OpenAI / HuggingFace",
      instructor: "Krish Naik",
      channelName: "Krish Naik",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Generative AI & LLM Series",
      docUrl: "https://python.langchain.com/docs/get_started/introduction",
      summary: "Transformer architecture overview, tokenization, prompt templates, chains, and invoking models via LangChain."
    },
    {
      id: "genai-02",
      title: "Building End-to-End RAG Systems with Vector Databases",
      durationMinutes: 48,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/tcqEUSNCn8I",
      youtubeUrl: "https://www.youtube.com/watch?v=tcqEUSNCn8I",
      videoTitle: "Building End-to-End RAG Systems with Vector Databases",
      instructor: "Krish Naik",
      channelName: "Krish Naik",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Generative AI & LLM Series",
      docUrl: "https://python.langchain.com/docs/use_cases/question_answering/",
      summary: "Document chunking, text embeddings (HuggingFace / OpenAI), vector indexing (Chroma / Pinecone), and context retrieval."
    }
  ],

  // 11. SQL & DBMS (Jenny's Lectures CS/IT, Gate Smashers)
  sql: [
    {
      id: "sql-01",
      title: "Introduction to DBMS & Database Architecture",
      durationMinutes: 32,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/kBdlM6hNDAE",
      youtubeUrl: "https://www.youtube.com/watch?v=kBdlM6hNDAE",
      videoTitle: "Introduction to DBMS & Database Architecture",
      instructor: "Jenny's Lectures CS/IT",
      channelName: "Jenny's Lectures CS/IT",
      language: "English",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "DBMS Complete Course",
      docUrl: "https://www.postgresql.org/docs/",
      summary: "Database schemas, 3-tier architecture, data abstraction, relational models, and primary vs foreign keys."
    },
    {
      id: "sql-02",
      title: "Database Normalization (1NF, 2NF, 3NF, BCNF) with Examples",
      durationMinutes: 40,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/5fs1PR85p1k",
      youtubeUrl: "https://www.youtube.com/watch?v=5fs1PR85p1k",
      videoTitle: "Database Normalization with Examples",
      instructor: "Jenny's Lectures CS/IT",
      channelName: "Jenny's Lectures CS/IT",
      language: "English",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "DBMS Complete Course",
      docUrl: "https://dev.mysql.com/doc/refman/8.0/en/",
      summary: "Functional dependencies, eliminating insertion/deletion anomalies, decomposition, and lossless join guarantees."
    },
    {
      id: "sql-03",
      title: "SQL Joins Explained (Inner, Left, Right, Full)",
      durationMinutes: 34,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/m9c049nS9lE",
      youtubeUrl: "https://www.youtube.com/watch?v=m9c049nS9lE",
      videoTitle: "SQL Joins Explained (Inner, Left, Right, Full)",
      instructor: "Jenny's Lectures CS/IT",
      channelName: "Jenny's Lectures CS/IT",
      language: "English",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "DBMS Complete Course",
      docUrl: "https://www.w3schools.com/sql/sql_join.asp",
      summary: "Combining multiple relational tables, join syntax, Venn diagram mental models, and performance considerations."
    }
  ],

  // 12. BACKEND DEVELOPMENT & NODE.JS (Chai aur Code)
  "backend-dev": [
    {
      id: "bed-01",
      title: "Node.js & Express Backend Architecture in Hindi",
      durationMinutes: 55,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/7fjOw8ApZ1I",
      youtubeUrl: "https://www.youtube.com/watch?v=7fjOw8ApZ1I",
      videoTitle: "Node.js & Express Backend Architecture in Hindi",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur Backend Series",
      docUrl: "https://nodejs.org/docs/latest/api/",
      summary: "HTTP methods, request-response lifecycles, Express middleware pipelines, CORS, and environment configuration."
    },
    {
      id: "bed-02",
      title: "Express.js Routers, Middleware & JWT Authentication",
      durationMinutes: 46,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/z3qS_36j3J0",
      youtubeUrl: "https://www.youtube.com/watch?v=z3qS_36j3J0",
      videoTitle: "Express.js Routers, Middleware & JWT Authentication",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur Backend Series",
      docUrl: "https://expressjs.com/",
      summary: "Modular routing, cookie-parser, password hashing with bcrypt, JWT token signing, and protected endpoint auth."
    }
  ],

  // 13. SYSTEM DESIGN (Gaurav Sen, Concept && Coding)
  "system-design": [
    {
      id: "sd-01",
      title: "System Design Primer for Real-World Applications",
      durationMinutes: 45,
      stage: "Intermediate",
      videoUrl: "https://www.youtube-nocookie.com/embed/xpDnVSmNFX0",
      youtubeUrl: "https://www.youtube.com/watch?v=xpDnVSmNFX0",
      videoTitle: "System Design for Real-World Applications",
      instructor: "Gaurav Sen",
      channelName: "Gaurav Sen",
      language: "English",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "System Design Masterclass",
      docUrl: "https://github.com/donnemartin/system-design-primer",
      summary: "Horizontal vs vertical scaling, monolithic vs microservice architectures, and CAP theorem trade-offs."
    },
    {
      id: "sd-02",
      title: "Load Balancing & Distributed Caching (Redis)",
      durationMinutes: 38,
      stage: "Advanced",
      videoUrl: "https://www.youtube-nocookie.com/embed/K0Ta65OqQkY",
      youtubeUrl: "https://www.youtube.com/watch?v=K0Ta65OqQkY",
      videoTitle: "Load Balancing and Distributed Caching",
      instructor: "Gaurav Sen",
      channelName: "Gaurav Sen",
      language: "English",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "System Design Masterclass",
      docUrl: "https://redis.io/docs/",
      summary: "Consistent hashing, round-robin algorithms, cache-aside vs write-through patterns, and cache eviction policies."
    }
  ],

  // 14. OPERATING SYSTEMS & CORE CS (Gate Smashers, Jenny's Lectures)
  "software-engineering": [
    {
      id: "se-01",
      title: "Software Development Life Cycle (SDLC) & Agile Models",
      durationMinutes: 28,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/bC4KgK_9904",
      youtubeUrl: "https://www.youtube.com/watch?v=bC4KgK_9904",
      videoTitle: "Software Development Life Cycle (SDLC) & Agile",
      instructor: "Gate Smashers",
      channelName: "Gate Smashers",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Software Engineering Gate Smashers",
      docUrl: "https://agilemanifesto.org/",
      summary: "Waterfall, Spiral, Agile Scrum workflows, sprint planning, retrospective ceremonies, and requirements engineering."
    }
  ],

  // 15. GIT & GITHUB (Chai aur Code, Apna College)
  git: [
    {
      id: "git-01",
      title: "Git & GitHub Complete Tutorial in Hindi",
      durationMinutes: 42,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/apGV9Kg7ics",
      youtubeUrl: "https://www.youtube.com/watch?v=apGV9Kg7ics",
      videoTitle: "Git & GitHub Complete Tutorial in Hindi",
      instructor: "Chai aur Code",
      channelName: "Chai aur Code",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Chai aur Git Series",
      docUrl: "https://git-scm.com/doc",
      summary: "Working directory, staging area, commit graphs, branch management, merge conflict resolution, and remote pushes."
    }
  ],

  // 16. CLOUD COMPUTING (5 Minutes Engineering, TechWorld with Nana)
  "cloud-computing": [
    {
      id: "cc-01",
      title: "Cloud Computing Fundamentals (IaaS, PaaS, SaaS)",
      durationMinutes: 18,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/2LaAJq1lB1Q",
      youtubeUrl: "https://www.youtube.com/watch?v=2LaAJq1lB1Q",
      videoTitle: "Cloud Computing Fundamentals (IaaS, PaaS, SaaS)",
      instructor: "5 Minutes Engineering",
      channelName: "5 Minutes Engineering",
      language: "Hindi",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Engineering Fundamentals in 5 Minutes",
      docUrl: "https://aws.amazon.com/what-is-cloud-computing/",
      summary: "Shared responsibility model, virtualization vs cloud services, and cost/elasticity advantages."
    }
  ],

  // 17. INTERVIEW PREPARATION (takeUforward / Striver, Love Babbar)
  "interview-prep": [
    {
      id: "ip-01",
      title: "Complete Technical & Coding Interview Roadmap",
      durationMinutes: 45,
      stage: "Beginner",
      videoUrl: "https://www.youtube-nocookie.com/embed/0bHoB3568Eg",
      youtubeUrl: "https://www.youtube.com/watch?v=0bHoB3568Eg",
      videoTitle: "Complete A2Z DSA & Interview Preparation Roadmap",
      instructor: "takeUforward (Striver)",
      channelName: "takeUforward",
      language: "Hinglish",
      isIndianCreator: true,
      isPlaylist: true,
      playlistTitle: "Striver Interview Mastery",
      docUrl: "https://takeuforward.org/",
      summary: "Coding rounds, online assessments, mock whiteboard interviews, and communication techniques with interviewers."
    }
  ]
};

// Apply updates to matching skills in catalog
let updatedSkillsCount = 0;
let updatedLessonsCount = 0;

for (const skill of catalog) {
  if (CURATED_SKILL_LESSONS[skill.id]) {
    const curated = CURATED_SKILL_LESSONS[skill.id];
    // Keep any non-replaced lessons or update matching lessons
    const newLessons = [];
    const curatedMap = new Map(curated.map(l => [l.id, l]));

    // First add all curated lessons
    for (const l of curated) {
      newLessons.push(l);
      updatedLessonsCount++;
    }

    // Preserve any existing lessons that weren't directly replaced
    for (const existingLesson of skill.lessons) {
      if (!curatedMap.has(existingLesson.id)) {
        // Tag with default language if missing
        newLessons.push({
          ...existingLesson,
          language: existingLesson.language || "English",
          isIndianCreator: existingLesson.isIndianCreator ?? false,
          youtubeUrl: existingLesson.videoUrl
            ? (existingLesson.videoUrl.includes("embed/")
                ? `https://www.youtube.com/watch?v=${existingLesson.videoUrl.split("embed/")[1]?.split("?")[0]}`
                : existingLesson.videoUrl)
            : undefined
        });
      }
    }

    skill.lessons = newLessons;
    updatedSkillsCount++;
  } else {
    // For other skills, normalize video fields (language, youtubeUrl)
    for (const l of skill.lessons) {
      if (l.videoUrl && !l.youtubeUrl) {
        l.youtubeUrl = l.videoUrl.includes("embed/")
          ? `https://www.youtube.com/watch?v=${l.videoUrl.split("embed/")[1]?.split("?")[0]}`
          : l.videoUrl;
      }
      if (!l.language) {
        l.language = "English";
      }
    }
  }
}

console.log(`Updated ${updatedSkillsCount} skills and ${updatedLessonsCount} curated lessons in catalog.`);

// Reassemble file
const newJsonStr = JSON.stringify(catalog, null, 2);
const newContent = content.substring(0, start) + newJsonStr + content.substring(end + 1);
fs.writeFileSync(catalogPath, newContent, "utf8");
console.log("Successfully wrote updated catalog to", catalogPath);
