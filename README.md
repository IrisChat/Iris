# Iris — Backend
_It's a social app_

Iris's Backend. Pair this along with [IrisChat/irisfrontend](https://github.com/IrisChat/irisfrontend)

## Running the server
Iris can be accessed [online](https://iris-frontend.fly.dev).

To run Iris locally, make sure you have [Node.JS](https://nodejs.org/en/) and [MongoDB Community Server](https://www.mongodb.com/try/download/community) preinstalled.

1. Create an empty and load your CLI
2. Clone the frontend and backend separately

```shell
$ git clone https://github.com/IrisChat/Iris
$ git clone https://github.com/IrisChat/irisfrontend

```

3. `cd` into the backend folder `Iris` and run

```shell
$ npm install

```

4. Afterward, run the server using `npm start`

If everything works, the server output should read `Iris:Server running on port [8080]`


## Running the frontend
Next, open a new terminal and navigate to the frontend folder `irisfrontend`

Enter the following commands:

```shell
$ npm install && npm run dev
```

Now, point your browser to `https://localhost:5173` and try creating an account.
