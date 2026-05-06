const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");
const {
  BASE_URL,
  getAllBooksAsync,
  getBooksByISBNPromise,
  getBooksByAuthor,
  getBooksByTitle,
} = require("./node_methods");

const OUTPUT_DIR = path.resolve(__dirname, "../../submission-ready");
const HTML_DIR = path.join(OUTPUT_DIR, "task-pages");
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, "coursera-upload-files");
const PROJECT_TITLE = "Express Book Reviews API Final Project";
const DEMO_USER = {
  username: "meetmohsin_reader",
  password: "ReviewPass123",
};
const DEMO_BOOK = {
  isbn: "8",
  author: "Jane Austen",
  title: "Pride and Prejudice",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function templatePage({ taskNumber, title, subtitle, requestMethod, endpoint, requestBody, note, codeLabel, codeSnippet, responseData }) {
  const prettyResponse = escapeHtml(JSON.stringify(responseData, null, 2));
  const prettyRequest = requestBody ? escapeHtml(JSON.stringify(requestBody, null, 2)) : null;
  const prettyCode = codeSnippet ? escapeHtml(codeSnippet.trim()) : null;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task ${taskNumber} - ${title}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #eef3f8;
        color: #10233c;
        font-family: Arial, Helvetica, sans-serif;
      }
      .page {
        width: 1320px;
        margin: 0 auto;
        padding: 28px;
      }
      .card {
        background: #ffffff;
        border: 1px solid #d5deeb;
        border-radius: 14px;
        box-shadow: 0 18px 45px rgba(16, 35, 60, 0.12);
        padding: 26px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 34px;
      }
      h2 {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 600;
        color: #3e5a78;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }
      .meta-box {
        border: 1px solid #d5deeb;
        border-radius: 10px;
        padding: 12px 14px;
        background: #f8fbff;
      }
      .meta-box strong {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        color: #516b86;
        text-transform: uppercase;
      }
      .note {
        margin: 0 0 18px;
        padding: 12px 14px;
        border-left: 4px solid #2a8f42;
        background: #f3fbf4;
        color: #1e5d2e;
        border-radius: 8px;
      }
      .two-col {
        display: grid;
        grid-template-columns: ${prettyCode ? "1fr 1fr" : "1fr"};
        gap: 18px;
      }
      .panel {
        border: 1px solid #d5deeb;
        border-radius: 10px;
        background: #f9fbfe;
        overflow: hidden;
      }
      .panel-title {
        padding: 12px 14px;
        background: #eaf1fb;
        font-weight: 700;
      }
      pre {
        margin: 0;
        padding: 16px;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 15px;
        line-height: 1.5;
        font-family: Consolas, "Courier New", monospace;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="card">
        <h1>Task ${taskNumber}: ${escapeHtml(title)}</h1>
        <h2>${escapeHtml(subtitle)}</h2>
        <div class="meta">
          <div class="meta-box"><strong>Method</strong>${escapeHtml(requestMethod)}</div>
          <div class="meta-box"><strong>Endpoint</strong>${escapeHtml(endpoint)}</div>
          <div class="meta-box"><strong>Project</strong>${escapeHtml(PROJECT_TITLE)}</div>
        </div>
        ${note ? `<p class="note">${escapeHtml(note)}</p>` : ""}
        <div class="two-col">
          ${prettyCode ? `<section class="panel"><div class="panel-title">${escapeHtml(codeLabel)}</div><pre>${prettyCode}</pre></section>` : ""}
          <section class="panel">
            <div class="panel-title">Response</div>
            <pre>${prettyResponse}</pre>
          </section>
        </div>
        ${prettyRequest ? `<section class="panel" style="margin-top:18px;"><div class="panel-title">Request Body</div><pre>${prettyRequest}</pre></section>` : ""}
      </div>
    </div>
  </body>
</html>`;
}

async function writeHtmlFile(fileName, content) {
  await fs.mkdir(HTML_DIR, { recursive: true });
  const target = path.join(HTML_DIR, fileName);
  await fs.writeFile(target, content, "utf-8");
  return target;
}

async function request(config) {
  return axios({
    validateStatus: () => true,
    ...config,
  });
}

async function generateEvidence() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const registerResponse = await request({
    method: "post",
    url: `${BASE_URL}/register`,
    data: DEMO_USER,
  });

  const loginResponse = await request({
    method: "post",
    url: `${BASE_URL}/customer/login`,
    data: DEMO_USER,
  });

  const cookieHeader = (loginResponse.headers["set-cookie"] || []).map((value) => value.split(";")[0]).join("; ");
  const reviewText = "A timeless story with unforgettable themes and characters.";

  const allBooksResponse = await request({ method: "get", url: `${BASE_URL}/` });
  const isbnResponse = await request({ method: "get", url: `${BASE_URL}/isbn/${DEMO_BOOK.isbn}` });
  const authorResponse = await request({ method: "get", url: `${BASE_URL}/author/${encodeURIComponent(DEMO_BOOK.author)}` });
  const titleResponse = await request({ method: "get", url: `${BASE_URL}/title/${encodeURIComponent(DEMO_BOOK.title)}` });
  const reviewResponse = await request({ method: "get", url: `${BASE_URL}/review/${DEMO_BOOK.isbn}` });
  const addReviewResponse = await request({
    method: "put",
    url: `${BASE_URL}/customer/auth/review/${DEMO_BOOK.isbn}`,
    headers: { Cookie: cookieHeader },
    data: { review: reviewText },
  });
  const deleteReviewResponse = await request({
    method: "delete",
    url: `${BASE_URL}/customer/auth/review/${DEMO_BOOK.isbn}`,
    headers: { Cookie: cookieHeader },
  });

  const asyncBooks = await getAllBooksAsync();
  const promisedIsbn = await getBooksByISBNPromise(DEMO_BOOK.isbn);
  const authorBooks = await getBooksByAuthor(DEMO_BOOK.author);
  const titleBooks = await getBooksByTitle(DEMO_BOOK.title);

  const tasks = [
    {
      fileName: "1-getallbooks.html",
      title: "Get the book list available in the shop",
      subtitle: "General user request for all books",
      requestMethod: "GET",
      endpoint: "/",
      responseData: allBooksResponse.data,
      note: `HTTP ${allBooksResponse.status} returned from the bookshop API.`,
    },
    {
      fileName: "2-getbooksbyISBN.html",
      title: "Get the books based on ISBN",
      subtitle: `General user request for ISBN ${DEMO_BOOK.isbn}`,
      requestMethod: "GET",
      endpoint: `/isbn/${DEMO_BOOK.isbn}`,
      responseData: isbnResponse.data,
      note: `HTTP ${isbnResponse.status} returned from the bookshop API.`,
    },
    {
      fileName: "3-getbooksbyauthor.html",
      title: "Get all books by the author",
      subtitle: `General user request for ${DEMO_BOOK.author}`,
      requestMethod: "GET",
      endpoint: `/author/${DEMO_BOOK.author}`,
      responseData: authorResponse.data,
      note: `HTTP ${authorResponse.status} returned from the bookshop API.`,
    },
    {
      fileName: "4-getbooksbytitle.html",
      title: "Get all books based on title",
      subtitle: `General user request for ${DEMO_BOOK.title}`,
      requestMethod: "GET",
      endpoint: `/title/${DEMO_BOOK.title}`,
      responseData: titleResponse.data,
      note: `HTTP ${titleResponse.status} returned from the bookshop API.`,
    },
    {
      fileName: "5-getbookreview.html",
      title: "Get a book review",
      subtitle: `General user request for reviews on ISBN ${DEMO_BOOK.isbn} before adding a review`,
      requestMethod: "GET",
      endpoint: `/review/${DEMO_BOOK.isbn}`,
      responseData: reviewResponse.data,
      note: `HTTP ${reviewResponse.status} returned from the bookshop API.`,
    },
    {
      fileName: "6-register.html",
      title: "Register new user",
      subtitle: "Create a demo registered user account",
      requestMethod: "POST",
      endpoint: "/register",
      requestBody: DEMO_USER,
      responseData: registerResponse.data,
      note: `HTTP ${registerResponse.status} returned from the bookshop API.`,
    },
    {
      fileName: "7-login.html",
      title: "Login as a registered user",
      subtitle: "Authenticate the demo user and create a session",
      requestMethod: "POST",
      endpoint: "/customer/login",
      requestBody: DEMO_USER,
      responseData: loginResponse.data,
      note: `HTTP ${loginResponse.status} returned from the bookshop API.`,
    },
    {
      fileName: "8-reviewadded.html",
      title: "Add or modify a book review",
      subtitle: `Registered user writes a review for ISBN ${DEMO_BOOK.isbn}`,
      requestMethod: "PUT",
      endpoint: `/customer/auth/review/${DEMO_BOOK.isbn}`,
      requestBody: { review: reviewText },
      responseData: addReviewResponse.data,
      note: `HTTP ${addReviewResponse.status} returned from the bookshop API using the login session cookie.`,
    },
    {
      fileName: "9-deletereview.html",
      title: "Delete the review added by that registered user",
      subtitle: `Registered user deletes their review for ISBN ${DEMO_BOOK.isbn}`,
      requestMethod: "DELETE",
      endpoint: `/customer/auth/review/${DEMO_BOOK.isbn}`,
      responseData: deleteReviewResponse.data,
      note: `HTTP ${deleteReviewResponse.status} returned from the bookshop API using the login session cookie.`,
    },
    {
      fileName: "10-getallbooks-async.html",
      title: "Get all books using an async callback function",
      subtitle: "Node.js method using async/await with Axios",
      requestMethod: "Node.js + Axios",
      endpoint: "getAllBooksAsync() -> GET /",
      codeLabel: "Method",
      codeSnippet: `
async function getAllBooksAsync() {
  const response = await axios.get(\`\${BASE_URL}/\`);
  return response.data;
}
      `,
      responseData: asyncBooks,
      note: "This screenshot shows the Axios async/await method and its result.",
    },
    {
      fileName: "11-searchbyisbn-promise.html",
      title: "Search by ISBN using Promises",
      subtitle: "Node.js method using Axios promise chaining",
      requestMethod: "Node.js + Axios",
      endpoint: `getBooksByISBNPromise('${DEMO_BOOK.isbn}') -> GET /isbn/${DEMO_BOOK.isbn}`,
      codeLabel: "Method",
      codeSnippet: `
function getBooksByISBNPromise(isbn) {
  return axios
    .get(\`\${BASE_URL}/isbn/\${encodeURIComponent(isbn)}\`)
    .then((response) => response.data);
}
      `,
      responseData: promisedIsbn,
      note: "This screenshot shows the Axios Promise-based ISBN lookup and its result.",
    },
    {
      fileName: "12-searchbyauthor.html",
      title: "Search by Author",
      subtitle: "Node.js method using async/await with Axios",
      requestMethod: "Node.js + Axios",
      endpoint: `getBooksByAuthor('${DEMO_BOOK.author}') -> GET /author/${DEMO_BOOK.author}`,
      codeLabel: "Method",
      codeSnippet: `
async function getBooksByAuthor(author) {
  const response = await axios.get(\`\${BASE_URL}/author/\${encodeURIComponent(author)}\`);
  return response.data;
}
      `,
      responseData: authorBooks,
      note: "This screenshot shows the Axios author search and its result.",
    },
    {
      fileName: "13-searchbytitle.html",
      title: "Search by Title",
      subtitle: "Node.js method using async/await with Axios",
      requestMethod: "Node.js + Axios",
      endpoint: `getBooksByTitle('${DEMO_BOOK.title}') -> GET /title/${DEMO_BOOK.title}`,
      codeLabel: "Method",
      codeSnippet: `
async function getBooksByTitle(title) {
  const response = await axios.get(\`\${BASE_URL}/title/\${encodeURIComponent(title)}\`);
  return response.data;
}
      `,
      responseData: titleBooks,
      note: "This screenshot shows the Axios title search and its result.",
    },
  ];

  for (let index = 0; index < tasks.length; index += 1) {
    const task = tasks[index];
    await writeHtmlFile(task.fileName, templatePage({
      taskNumber: index + 1,
      ...task,
    }));
  }

  await fs.writeFile(path.join(OUTPUT_DIR, "project-title.txt"), `${PROJECT_TITLE}\n`, "utf-8");
  await fs.writeFile(
    path.join(OUTPUT_DIR, "14-github-link.txt"),
    "https://github.com/meetmohsin/expressBookReviews\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(OUTPUT_DIR, "what-to-submit.txt"),
    [
      "Upload these screenshot files:",
      "1-getallbooks.png",
      "2-getbooksbyISBN.png",
      "3-getbooksbyauthor.png",
      "4-getbooksbytitle.png",
      "5-getbookreview.png",
      "6-register.png",
      "7-login.png",
      "8-reviewadded.png",
      "9-deletereview.png",
      "10-getallbooks-async.png",
      "11-searchbyisbn-promise.png",
      "12-searchbyauthor.png",
      "13-searchbytitle.png",
      "",
      "Task 14 URL:",
      "14-github-link.txt",
      "",
      "Project Title:",
      "project-title.txt",
    ].join("\n"),
    "utf-8"
  );
}

generateEvidence().catch(async (error) => {
  console.error(error.response ? error.response.data : error.message);
  process.exit(1);
});
