const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;

	const currentUser = users.find((user) => user.username === username);

	if (!currentUser) {
		return response.status(404).json({ error: 'Not exists user account' });
	}

	request.currentUser = currentUser;
	return next();
}

function checksExistsTodo(request, response, next) {
	const { currentUser } = request;
	const { id } = request.params;

	const { todos } = currentUser;

	currentTodo = todos.find((todo) => todo.id === id);

	if (!currentTodo) {
		return response.status(404).json({ error: 'Todo non existing' });
	}

	request.currentTodo = currentTodo;
	return next();
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;

	const usernameAlreadyExists = users.some((user) => user.username === username);

	if (usernameAlreadyExists) {
		return response.status(400).json({ error: 'This username already exists' });
	}

	const newUser = {
		id: uuidv4(),
		name,
		username,
		todos: []
	}

	users.push(newUser);
	return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	const { currentUser } = request;

	const { todos } = currentUser;
	return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { currentUser } = request;
	const { title, deadline } = request.body;

	const newTodo = {
		id: uuidv4(),
		title,
		done: false,
		deadline: new Date(deadline),
		created_at: new Date()
	}

	currentUser.todos.push(newTodo);
	return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
	const { title, deadline } = request.body;

	const { currentTodo } = request;
	currentTodo.title = title;
	currentTodo.deadline = new Date(deadline);

	return response.status(201).json(currentTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
	const { currentTodo } = request;

	currentTodo.done = true;
	return response.status(201).json(currentTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
	const { currentUser, currentTodo } = request;
	const { todos } = currentUser;

	const indexTodo = todos.indexOf(currentTodo);
	todos.splice(indexTodo, 1);

	return response.status(204).send();
});

module.exports = app;