/*
 * User Controller - Presentation Layer
 * Handle HTTP requests untuk User endpoints
 */
import { Elysia, t } from 'elysia';
import { UserService } from '../../application/services/UserService';

export function createUserController(userService: UserService) {
  return new Elysia({ prefix: '/users' })
    
    /*
     * GET /users - Ambil semua users
     */
    .get('/', async ({ query }) => {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      
      return userService.getUsers(page, limit);
    }, {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String())
      })
    })

    /*
     * GET /users/:id - Ambil user by ID
     */
    .get('/:id', async ({ params, set }) => {
      const user = await userService.getUserById(params.id);
      
      if (!user) {
        set.status = 404;
        return { error: 'User tidak ditemukan' };
      }
      
      return user;
    }, {
      params: t.Object({
        id: t.String()
      })
    })

    /*
     * POST /users - Buat user baru
     */
    .post('/', async ({ body, set }) => {
      try {
        const user = await userService.createUser(body);
        set.status = 201;
        return user;
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    }, {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String()
      })
    })

    /*
     * PUT /users/:id - Update user
     */
    .put('/:id', async ({ params, body, set }) => {
      try {
        const user = await userService.updateUser({
          id: params.id,
          ...body
        });
        
        if (!user) {
          set.status = 404;
          return { error: 'User tidak ditemukan' };
        }
        
        return user;
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    }, {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String()),
        password: t.Optional(t.String())
      })
    })

    /*
     * DELETE /users/:id - Hapus user
     */
    .delete('/:id', async ({ params, set }) => {
      try {
        const deleted = await userService.deleteUser(params.id);
        
        if (!deleted) {
          set.status = 404;
          return { error: 'User tidak ditemukan' };
        }
        
        return { message: 'User berhasil dihapus' };
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    }, {
      params: t.Object({
        id: t.String()
      })
    });
}
