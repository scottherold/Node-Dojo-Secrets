// This module handles 'root' routing
module.exports = (app, server) => {
    // <--- Routing --->
    // ** GET Routes **
    // Root
    app.get('/', (req, res) => {
        res.render('index');
    })
}