const express = require('express')

const app = express()

const path = require('path')

const datapath = path.join(__dirname, 'moviesData.db')

const {open} = require('sqlite')

app.use(express.json())

module.exports = app

const sqlite3 = require('sqlite3')

let moviesDatabase = null

const IntialisationDatabaseandRunServer = async () => {
  try {
    moviesDatabase = await open({
      filename: datapath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is running http://localhost:3000')
    })
  } catch (e) {
    console.log(`Data base Error: ${e.message}`)
    exit(1)
  }
}

IntialisationDatabaseandRunServer()

const convertDatabaseResponseToCamelResponse = movie => {
  return {
    movieName: movie.movie_name,
  }
}

//API 1
app.get('/movies/', async (request, response) => {
  const movieslistQuery = `
  SELECT movie_name FROM movie ORDER BY movie_id;
  `
  const moviesList = await moviesDatabase.all(movieslistQuery)

  /*
  response.send(moviesList)
  response.send(
  moviesList.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
  */

  response.send(
    moviesList.map(movie => convertDatabaseResponseToCamelResponse(movie)),
  )

  //response.send(moviesList)
})

const convertResponseToDatabaseResponse = movie => {
  return {
    director_id: movie.directorId,
    movie_name: movie.movieName,
    lead_actor: movie.leadActor,
  }
}

//API 2

app.post('/movies/', async (request, response) => {
  //const {movie_id} = request.params,
  const movieDetails = request.body

  const movieData = convertResponseToDatabaseResponse(movieDetails)

  const {movie_id, director_id, movie_name, lead_actor} = movieData;
  console.log(director_id);
  console.log(movie_name);
  console.log(lead_actor);

  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      (
        ${director_id},
        '${movie_name}',
        '${lead_actor}'
      );`

  const movieAddedResponse = await moviesDatabase.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

const convertDatabaseResponseToCamelResponseofFulldata = movie => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  }
}

//API 3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `SELECT * FROM movie WHERE movie_id =${movieId};`

  const movieOfparticleId = await moviesDatabase.get(getMovieQuery)

  response.send(
    convertDatabaseResponseToCamelResponseofFulldata(movieOfparticleId),
  )
})

// API 4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const movieDetails = request.body

  const movieData = convertResponseToDatabaseResponse(movieDetails)

  const {director_id, movie_name, lead_actor} = movieData

  const modifymoviedetails = `
  UPDATE movie SET  
  director_id=${director_id},
  movie_name='${movie_name}',
  lead_actor='${lead_actor}'
  WHERE movie_id=${movieId};
  `

  await moviesDatabase.run(modifymoviedetails)
  response.send('Movie Details Updated')
})

//API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteMovieQuery = `
  DELETE FROM movie WHERE movie_id =${movieId};
  `
  await moviesDatabase.run(deleteMovieQuery)

  response.send('Movie Removed')
})

const convertDirectDatabaseResponseToResponse = director => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  }
}
//API 6
app.get('/directors/', async (request, response) => {
  const directorlistQuery = `
  SELECT * FROM director ORDER BY director_id;
  `
  const directorList = await moviesDatabase.all(directorlistQuery)

  response.send(
    directorList.map(director =>
      convertDirectDatabaseResponseToResponse(director),
    ),
  )
})

const convertDatabaseResponseToCamelResponseofDirector = director => {
  return {
    movieName: director.movie_name,
  }
}
//API 7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const directormoviesQuery = `
  SELECT movie_name FROM movie WHERE director_id = ${directorId};
  `

  const Directormovies = await moviesDatabase.all(directormoviesQuery)
  response.send(
    Directormovies.map(movie =>
      convertDatabaseResponseToCamelResponseofDirector(movie),
    ),
  )

  //response.send(Directormovies)
})
