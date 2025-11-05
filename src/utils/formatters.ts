/**
 * Utilitários de formatação e validação
 */

// Máscara de telefone brasileiro (##) #####-####
export function maskPhone(value: string): string {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (numbers.length <= 10) {
    // (##) ####-####
    return numbers
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // (##) #####-####
    return numbers
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15); // Limita o tamanho
  }
}

// Valida telefone brasileiro
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  const numbers = phone.replace(/\D/g, '');
  
  // Deve ter 10 ou 11 dígitos
  if (numbers.length !== 10 && numbers.length !== 11) return false;
  
  // DDD deve estar entre 11 e 99
  const ddd = parseInt(numbers.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Primeiro dígito do número não pode ser 0 ou 1
  const firstDigit = numbers.charAt(2);
  if (firstDigit === '0' || firstDigit === '1') return false;
  
  return true;
}

// Máscara de CEP #####-###
export function maskCEP(value: string): string {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}

// Valida CEP
export function validateCEP(cep: string): boolean {
  if (!cep) return false;
  const numbers = cep.replace(/\D/g, '');
  return numbers.length === 8;
}

// Busca endereço pelo CEP usando ViaCEP
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function buscarCEP(cep: string): Promise<ViaCEPResponse | null> {
  try {
    const numbers = cep.replace(/\D/g, '');
    
    if (!validateCEP(numbers)) {
      throw new Error('CEP inválido');
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }
    
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

// Validação de senha forte
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'A senha deve ter no mínimo 6 caracteres' };
  }
  
  if (password.length < 8) {
    return { valid: true, message: 'Senha fraca. Recomendamos no mínimo 8 caracteres' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (strength < 2) {
    return { valid: true, message: 'Senha fraca. Use letras, números e caracteres especiais' };
  }
  
  if (strength < 3) {
    return { valid: true, message: 'Senha média. Considere adicionar mais variedade' };
  }
  
  return { valid: true, message: 'Senha forte' };
}

// Formata nome próprio (primeira letra maiúscula)
export function formatName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
