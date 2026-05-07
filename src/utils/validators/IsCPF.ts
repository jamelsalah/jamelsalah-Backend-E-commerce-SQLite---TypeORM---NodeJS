import { registerDecorator, ValidationOptions } from "class-validator";

function isValidCPF(cpf: string): boolean {

    const digits = cpf.replace(/\D/g, "");

    if (digits.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (000..., 111..., etc.)
    if (/^(\d)\1{10}$/.test(digits)) return false;

    // Primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(digits[i]!, 10) * (10 - i);
    }
    let check = 11 - (sum % 11);
    if (check >= 10) check = 0;
    if (check !== parseInt(digits[9]!, 10)) return false;

    // Segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(digits[i]!, 10) * (11 - i);
    }
    check = 11 - (sum % 11);
    if (check >= 10) check = 0;
    if (check !== parseInt(digits[10]!, 10)) return false;

    return true;
}

export function IsCPF(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isCPF",
            target: object.constructor,
            propertyName,
            ...(validationOptions && { options: validationOptions }),
            validator: {
                validate(value: unknown) {
                    return typeof value === "string" && isValidCPF(value);
                },
                defaultMessage() {
                    return "CPF inválido";
                },
            },
        });
    };
}
