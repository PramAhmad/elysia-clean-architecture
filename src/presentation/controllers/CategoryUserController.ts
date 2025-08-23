/*
 * CategoryUser Controller - Presentation Layer
 * Handle HTTP requests untuk CategoryUser endpoints
 */
import { Elysia, t } from 'elysia';
import { CategoryUserService } from '../../application/services/CategoryUserService';

export function createCategoryUserController(categoryUserService: CategoryUserService) {
  return new Elysia({ prefix: '/category-users' })
    
    /*
     * GET /category-users - Ambil semua category users
     */
    .get('/', async ({ query }) => {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      
      return categoryUserService.getCategoryUsers(page, limit);
    }, {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String())
      })
    })

    /*
     * GET /category-users/:id - Ambil category user by ID
     */
    .get('/:id', async ({ params, set }) => {
      const categoryUser = await categoryUserService.getCategoryUserById(params.id);
      
      if (!categoryUser) {
        set.status = 404;
        return { error: 'Kategori user tidak ditemukan' };
      }
      
      return categoryUser;
    }, {
      params: t.Object({
        id: t.String()
      })
    })

    /*
     * POST /category-users - Buat category user baru
     */
    .post('/', async ({ body, set }) => {
      try {
        const categoryUser = await categoryUserService.createCategoryUser(body);
        set.status = 201;
        return categoryUser;
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    }, {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String())
      })
    })

    /*
     * PUT /category-users/:id - Update category user
     */
    .put('/:id', async ({ params, body, set }) => {
      try {
        const categoryUser = await categoryUserService.updateCategoryUser({
          id: params.id,
          ...body
        });
        
        if (!categoryUser) {
          set.status = 404;
          return { error: 'Kategori user tidak ditemukan' };
        }
        
        return categoryUser;
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
        description: t.Optional(t.String())
      })
    })

    /*
     * DELETE /category-users/:id - Hapus category user
     */
    .delete('/:id', async ({ params, set }) => {
      try {
        const deleted = await categoryUserService.deleteCategoryUser(params.id);
        
        if (!deleted) {
          set.status = 404;
          return { error: 'Kategori user tidak ditemukan' };
        }
        
        return { message: 'Kategori user berhasil dihapus' };
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
