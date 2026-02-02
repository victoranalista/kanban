import { z } from 'zod';

export default z.object({
  code: z.string().min(3, {
    message: 'Código de serviço é obrigatório'
  }),
  name: z.string().min(3, {
    message: 'Nome do serviço é obrigatório'
  })
});
