'use strict';

// Importamos las dependencias necesarias
const axios = require ('axios');

// Modelo del seed de Peliculas
const addMovies = async ( movies, page ) => {

  const res = await axios.get ('https://api.themoviedb.org/3/movie/popular?api_key=cea68b520beecac6718820e4ac576c3a&append_to_response=credits&language=es-ES&page=' + page);
  const now = new Date ();

  const moviesChunk = res.data.results.map ( movie => ({
    title: movie.title,
    poster_path: movie.poster_path,
    overview: movie.overview,
    release_date: movie.release_date,
    createdAt: now,
    updatedAt: now
}))

movies.push ( ...moviesChunk );

return res.data.total_pages
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {

      const movies = [];
      const total_pages = await addMovies (movies, 1)


      for ( let i = 2; i < 10; i ++ ) {
        await addMovies ( movies, i );
        console.log ( i )
      }

      // Console log para ver las paginas que nos trae
      console.log (movies.length)

      await queryInterface.bulkInsert ('movies', movies, {});
    } 
    catch (error) {
      console.error ( error.message )
    }
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete ('movies', null, {})

  }
};
