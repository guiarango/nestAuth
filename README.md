<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

1. Clone the repository

2. Install Nest CLI

```
npm i -g @nestjs/cli
```

3. Execute

```
npm install
```

4. Clone the file **.env.template** 3 times and rename the copies to **.env.development**, **.env.production** and **.env.testing**

5. Fill the environmet variables from **.env.** file you have just created

<!-- 6. Start the database container that you want to use

```
docker-compose -f docker-compose.development.yaml up -d
```

or

```
docker-compose -f docker-compose.testing.yaml up -d
``` -->

6. Start the application depending on the database you started:

```
npm run start:dev
```

or

```
npm run start:test
```

<!-- 8. Run the seed with a get method

```
http://localhost:3000/api/v1/seed
``` -->

# Stack

- MongoDB
- Nest
