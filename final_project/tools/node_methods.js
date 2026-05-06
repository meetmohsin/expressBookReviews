const {
  BASE_URL,
  getAllBooksAsync,
  getBooksByISBNPromise,
  getBooksByAuthor,
  getBooksByTitle,
} = require("../router/general");

async function runFromCli() {
  const task = process.argv[2];

  if (task === "all") {
    console.log(JSON.stringify(await getAllBooksAsync(), null, 2));
    return;
  }

  if (task === "isbn") {
    console.log(JSON.stringify(await getBooksByISBNPromise(process.argv[3] || "1"), null, 2));
    return;
  }

  if (task === "author") {
    console.log(JSON.stringify(await getBooksByAuthor(process.argv[3] || "Jane Austen"), null, 2));
    return;
  }

  if (task === "title") {
    console.log(JSON.stringify(await getBooksByTitle(process.argv[3] || "Pride and Prejudice"), null, 2));
    return;
  }

  console.log("Usage:");
  console.log("  node tools/node_methods.js all");
  console.log("  node tools/node_methods.js isbn 1");
  console.log("  node tools/node_methods.js author \"Jane Austen\"");
  console.log("  node tools/node_methods.js title \"Pride and Prejudice\"");
}

if (require.main === module) {
  runFromCli().catch((error) => {
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
      process.exit(1);
    }

    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  BASE_URL,
  getAllBooksAsync,
  getBooksByISBNPromise,
  getBooksByAuthor,
  getBooksByTitle,
};
