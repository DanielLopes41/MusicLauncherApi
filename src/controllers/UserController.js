import User from '../models/User.js';

export class UserController {
    async store(req, res) {
        try {
            const newUser = await User.create(req.body);
            return res.json(newUser);
        } catch (e) {
            console.error(e); 
            if (e.errors) {
                return res.status(400).json({
                    errors: e.errors.map(err => err.message)
                });
            }

            return res.status(500).json({ error: 'Erro interno no servidor' });
        }
    }
    async show(req, res) {
        try {
            const users = await User.findAll();
            return res.json(users);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Erro interno no servidor' });
        }
    }
    
    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
    
            if (!user) {
                return res.status(400).json({ errors: ['Usuário não existe'] });
            }
    
            await user.destroy();
            return res.json({ message: 'Usuário deletado com sucesso' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Erro interno no servidor' });
        }
    }
    
    async update(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
    
            if (!user) {
                return res.status(400).json({ errors: ['Usuário não existe'] });
            }
    
            await user.update(req.body);
            return res.json(user);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Erro interno no servidor' });
        }
    }
}
export default new UserController();
