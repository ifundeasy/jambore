Jambore
======
> Jambore '16 monitoring; Web application with socket clustering.

### installation
```sh
$ sudo npm install
```
```sh
$ sudo npm install -g bower
```
```sh
$ cd ../public
```
```sh
$ bower install
```

### application start [dev]
```sh
# mongod
$ sh ./mongod


# web server
$ node ./server.js
```

### application start [prod]
```sh
$ pm2 start jambore.json
```

### application restart [prod]
```sh
$ pm2 restart jambore.json
```

### application stop [prod]
```sh
$ pm2 restart jambore.json
```