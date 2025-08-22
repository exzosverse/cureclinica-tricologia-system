import { z } from "zod";

// Enums para tipos específicos de tricologia
export const HairTypeEnum = z.enum(["straight", "wavy", "curly", "coily"]);
export const ScalpConditionEnum = z.enum(["normal", "dry", "oily", "sensitive", "irritated"]);
export const GenderEnum = z.enum(["male", "female", "other"]);

// Schema para escala Ludwig (mulheres)
export const LudwigScaleEnum = z.enum(["I", "I-2", "I-3", "I-4", "II", "II-1", "II-2", "III"]);

// Schema para escala Norwood-Hamilton (homens)
export const NorwoodScaleEnum = z.enum(["I", "II", "IIa", "III", "IIIa", "III-vertex", "IV", "IVa", "V", "Va", "VI", "VII"]);

// Validação de CPF brasileiro
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

export const patientFormSchema = z.object({
  // Informações Pessoais
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().regex(cpfRegex, "CPF inválido - formato: 000.000.000-00"),
  phone: z.string().regex(phoneRegex, "Telefone inválido - formato: (00) 00000-0000"),
  date_of_birth: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  gender: GenderEnum,
  
  // Endereço
  address: z.object({
    street: z.string().min(3, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro é obrigatório"),
    city: z.string().min(2, "Cidade é obrigatória"),
    state: z.string().length(2, "Estado deve ter 2 caracteres"),
    zip_code: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido - formato: 00000-000"),
  }),
  
  // Informações Médicas
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
  
  // Informações Capilares
  hair_type: HairTypeEnum,
  scalp_condition: ScalpConditionEnum,
  hair_loss_duration: z.string().optional(),
  previous_treatments: z.string().optional(),
  
  // Escalas de Avaliação (condicional baseado no gênero)
  ludwig_scale: z.optional(LudwigScaleEnum),
  norwood_scale: z.optional(NorwoodScaleEnum),
  
  // Observações
  notes: z.string().optional(),
  
  // Foto do paciente
  profile_photo: z.any().optional(), // Para upload de arquivo
}).refine(
  (data) => {
    // Se for mulher, pode ter escala Ludwig
    // Se for homem, pode ter escala Norwood
    if (data.gender === "female" && data.norwood_scale) {
      return false;
    }
    if (data.gender === "male" && data.ludwig_scale) {
      return false;
    }
    return true;
  },
  {
    message: "Escala de avaliação incorreta para o gênero selecionado",
    path: ["gender"],
  }
);

export type PatientFormData = z.infer<typeof patientFormSchema>;

// Schema para validação de idade
export const validateAge = (date: Date): boolean => {
  const today = new Date();
  const birthDate = new Date(date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18 && age <= 120;
};

// Função para formatar CPF
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

// Função para formatar telefone
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

// Função para formatar CEP
export const formatZipCode = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
};