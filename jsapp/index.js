#!/usr/bin/env node

const http = require('http');

const tasks = [];

const handleRequest = (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

  if (pathname === '/api' && req.method === 'GET') {
    let filteredTasks = [...tasks];

    if (queryParams.name) {
      filteredTasks = filteredTasks.filter(task =>
          task.name.toLowerCase().includes(queryParams.name.toLowerCase())
      );
    }

    if (queryParams.due_date) {
      filteredTasks = filteredTasks.filter(task => task.due_date === queryParams.due_date);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filteredTasks.length > 0 ? filteredTasks : []));

  } else if (pathname === '/api' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const params = Object.fromEntries(new URLSearchParams(body));

      if (!params.name || !params.due_date) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Missing required fields: name and due_date' }));
        return;
      }

      tasks.push({ name: params.name, due_date: params.due_date });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task added', tasks }));
    });

  } else if (pathname === '/api' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const params = Object.fromEntries(new URLSearchParams(body));

      if (!params.old_name || (!params.new_name && !params.due_date)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Missing required fields: old_name and at least one of new_name or due_date' }));
        return;
      }

      const task = tasks.find(t => t.name === params.old_name);
      if (!task) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
        return;
      }

      if (params.new_name) task.name = params.new_name;
      if (params.due_date) task.due_date = params.due_date;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task updated', task }));
    });

  } else if (pathname === '/api' && req.method === 'DELETE') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const params = Object.fromEntries(new URLSearchParams(body));

      if (!params.name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Missing required field: name' }));
        return;
      }

      const taskIndex = tasks.findIndex(t => t.name === params.name);
      if (taskIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
        return;
      }

      tasks.splice(taskIndex, 1);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task deleted' }));
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
};

const server = http.createServer(handleRequest);
server.listen(3000);
