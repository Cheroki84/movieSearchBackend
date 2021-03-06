const {
    User
} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserController = {
    async signup(req, res) {
        let regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        let regExEmail = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/;

        if (!regExEmail.test(req.body.email)) {
            res.send({
                message:
                'El formato del email no es válido, acuérdate de la @ y del .'}
            );
            return;
        }

        if (!regExPassword.test(req.body.password)) {
            res.send({
                message:
                'El password debe contener al menos: entre 8 y 16 caracteres, 1 número, 1 letra minúscula, 1 letra mayúscula y 1 carácter especial'
                }
            );
            return;
        }


        try {
            req.body.password = await bcrypt.hash(req.body.password, 9)
            const user = await User.create(req.body);
            res.status(201).send(user)
        } catch (error) {
            console.error(error);
            res.status(500).send({
                error,
                message: 'Hubo un error al intentar registrar al usuario'
            })
        }
    },
    async login(req, res) {
        try {
            const user = await User.findOne({
                where: {
                    email: req.body.email
                }
            })
            if (!user) {
                return res.status(400).send({
                    message: 'Error al introducir los datos'
                })
            }
            const isMatch = await bcrypt.compare(req.body.password, user.password)
            if (!isMatch) {
                return res.status(400).send({
                    message: 'Error al introducir los datos'
                })
            }
            const token = jwt.sign({
                id: user.id
            }, 'supercalifragilisticoespialidoso', {
                expiresIn: '30d'
            });
            console.log(token)
            user.token = token;
            await user.save()
            res.send(user);
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: 'Hubo un problema al intentar iniciar sesión'
            })
        }

    },

    async logout(req, res) {
        try {
            const updateValues = {
                token: ""
            };
            const user = await User.update(updateValues, {
                where: {
                    email: req.params.email
                }
            });
            res.send({
                message: `Goodbye ${user.firstname}`
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({
                error,
                message: 'Hubo un problema'
            })
        }
    },

    async getByEmail(req, res) {
        try {
            const email = await User.findOne({
                where: {
                    email: req.params.email
                },
                attributes: {
                    exclude: ['token', 'id']
                }
            })
            if (!email) {
                return res.status(400).send({
                    message: 'Email not found'
                })
            }
            res.send(email);
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: 'There was a problem trying to get the user'
            })
        }
    },

    /*
    getByEmail(req, res) {
        User.findAll({
                where: {
                    email: req.params.email
                }, attributes: {
                    exclude: ['token', 'id']
                }
            })
            .then(user => res.send(user))
            .catch(error => {
                console.error(error);
                res.status(500).send({
                    message: 'There was a problem trying to get the user'
                })
            })
    },*/

    async delete(req, res) {
        try {
            const email = await User.destroy({
                where: {
                    email: req.body.email
                }
            })
            if (!email) {
                return res.status(400).send({
                    message: 'Email not found'
                })
            }
            res.send({
                message: 'Account successfully removed'
            })
        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: 'There was a problem trying to remove the account'
            })
        }
    }

    /*
    delete(req, res) {
        User.destroy({
                where: {
                    email: req.body.email
                }
            })
            .then((email) => {
                if (!email) {
                    return res.send({
                        message: 'Email not found'
                    })
                }
                res.send({
                    message: 'Account successfully removed'
                })
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({
                    message: 'There was a problem trying to remove the account'
                })
            })
    }*/
}



module.exports = UserController;