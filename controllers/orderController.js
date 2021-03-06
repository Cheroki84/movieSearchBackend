const { Order, movie, User } = require('../models');

const OrderController = {
    async getAll(req, res) {
        try{
            const orders = await Order.findAll({
                attributes: {
                    exclude: ['UserId']
                },
                include: [{
                    model: movie,
                    attributes: ['title'],
                    through: {
                        attributes: []
                    }
                }, {
                    model: User,
                    attributes: ['firstname', 'email']
                }]
            });
            res.send(orders);
        } catch (error) {
            console.error(error);
            res.status(500).send({
                error,
                message: 'There was a problem trying to get the orders'
            })
        }
    }, 
    async create (req, res) {
        try {
            const returnDate = new Date();
            returnDate.setDate(returnDate.getDate() + 2)
            
            const order = await Order.create({
                status: 'Rented',
                returnDate,
                UserId: req.user.id
            });
                const movie = await order.addMovie(req.body.movies)
                
                res.send({
                    message: 'Order successfully completed'
                })
            
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: 'There was a problem+ trying to create the order'
            })
        }
    },

    async getUserOrders(req, res) {
        try{
            const userOrders = await Order.findAll({
                where: {
                    UserId: req.params.UserId
                },
                include: [{
                    model: movie,
                    attributes: ['title', 'poster_path'],
                    through: {
                        attributes: []
                    }
                }]
            });
            res.send(userOrders);
        } catch(error) {
            res.status(500).send({
                message: 'error al traer los pedidos'
            })
        }
    }

    //Crear pedido en promesas
    /*create(req, res) {
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 2)
        Order.create({
            status: 'Rented',
            returnDate,
            UserId: req.user.id
        })
        .then(order => {
            return order.addMovie(req.body.movies);
        })
        .then(() => res.send({
            message: 'order successfully completed'
        }))
        .catch(error => {
            console.error(error);
            res.status(500).send({
                message: 'There was a problema trying to create the order'
            })
        })
    }*/
}

module.exports = OrderController;