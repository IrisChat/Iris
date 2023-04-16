# Ether — Backend
_It's a social app_

Ether's Backend. Pair this along with [EtherComm/etherfrontend](https://github.com/EtherComm/etherfrontend)

## Running the server
Ether can be accessed [online](https://iris-frontend.fly.dev).

To run Ether locally, make sure you have [Node.JS](https://nodejs.org/en/) and [MongoDB Community Server](https://www.mongodb.com/try/download/community) preinstalled.

1. Create an empty and load your CLI
2. Clone the frontend and backend separately

```shell
$ git clone https://github.com/EtherComm/Ether
$ git clone https://github.com/EtherComm/etherfrontend

```

3. `cd` into the backend folder `Ether` and run

```shell
$ npm install

```

4. Afterward, run the server using `npm start`

If everything works, the server output should read `Iris:Server running on port [8080]`


## Running the frontend
Next, open a new terminal and navigate to the frontend folder `etherfrontend`

Enter the following commands:

```shell
$ npm install && npm run dev
```

Now, point your browser to `https://localhost:5173` and try creating an account.
