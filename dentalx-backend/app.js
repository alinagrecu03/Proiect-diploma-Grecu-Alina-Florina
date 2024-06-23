// aici e zona de import al librariilor
const {
  app,
  port
} = require('./configuration');

const postRoutes = require('./posts');
const putRoutes = require('./puts');
const deleteRoutes = require('./delets');
const getRoutes = require('./gets');

app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/put', putRoutes);
app.use('/api/v1/delete', deleteRoutes);
app.use('/api/v1/get', getRoutes);

// punem aplicatia sa asculte pe portul setat de noi
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})