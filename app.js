const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const convertDbObjectToTodoObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen("3000", () => {
      console.log("*** Server is running at http://localhost:3000/ ***");
    });
  } catch (error) {
    console.log(`Db Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  console.log(status);
  const getTodoQuery = `
    SELECT
       *
    FROM
        todo
    WHERE
        status = '${status}' OR priority = '${priority}' OR (priority = '${priority}' AND status = '${status}') OR todo LIKE '%${search_q}%';`;
  const todoResponse = await db.all(getTodoQuery);
  response.send(
    todoResponse.map((eachTodo) => convertDbObjectToTodoObject(eachTodo))
  );
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoById = `
    SELECT
      *
    FROM
        todo
    WHERE
        Id = ${todoId};`;
  const todoDetails = await db.get(getTodoById);
  response.send(convertDbObjectToTodoObject(todoDetails));
});

//API 3

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
    INSERT INTO
    todo (id, todo, priority, status)
    VALUES(
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

// API 4

app.put("/todos/:todoId/", async (request, response) => {
  const todoDetails = request.body;
  const { todoId } = request.params;
  const key = Object.keys(todoDetails);
  if (key[0] === "todo") {
    const { todo } = todoDetails;
    const updateTodoQuery = `
    UPDATE 
        todo
    SET
        todo = '${todo}'
    WHERE
        id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  } else if (key[0] === "status") {
    const { status } = todoDetails;
    const updateTodoQuery = `
    UPDATE 
        todo
    SET
        status = '${status}'
    WHERE
        id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Status Updated");
  } else if (key[0] === "priority") {
    const { priority } = todoDetails;
    const updateTodoQuery = `
    UPDATE 
        todo
    SET
        priority = '${priority}'
    WHERE
        id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Priority Updated");
  }
});

// API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE
    FROM
        todo
    WHERE
        id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
