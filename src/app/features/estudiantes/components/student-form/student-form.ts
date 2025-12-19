import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss',
})
export class StudentForm {
  studentForm: FormGroup;
  collapsedSections: { [key: string]: boolean } = {
    identificacion: false,
    datosPersonales: false,
    discapacidad: false,
    nacionalidad: false,
    informacionAcademica: false,
    informacionEconomica: false,
    practicasPreprofesionales: false,
    becasAyudas: false,
    vinculacionSocial: false,
    contacto: false,
    datosHogar: false
  };

  constructor(private fb: FormBuilder) {
    this.studentForm = this.createForm();
    this.setupConditionalValidators();
  }

  // Validadores personalizados
  static integerValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const num = Number(control.value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return { integer: { value: control.value } };
      }
      if (num < min || num > max) {
        return { integerRange: { value: control.value, min, max } };
      }
      return null;
    };
  }

  // Validador para enteros de 1 dígito (1-9)
  static integer1Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const num = Number(control.value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return { integer: { value: control.value } };
      }
      if (num < 1 || num > 9) {
        return { integer1Range: { value: control.value } };
      }
      return null;
    };
  }

  // Validador para enteros de 2 dígitos (1-99)
  static integer2Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const num = Number(control.value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return { integer: { value: control.value } };
      }
      if (num < 1 || num > 99) {
        return { integer2Range: { value: control.value } };
      }
      return null;
    };
  }

  // Validador para enteros de 3 dígitos (0-999)
  static integer3Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const num = Number(control.value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return { integer: { value: control.value } };
      }
      if (num < 0 || num > 999) {
        return { integer3Range: { value: control.value } };
      }
      return null;
    };
  }

  // Validador para enteros de 4 dígitos (0-9999)
  static integer4Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const num = Number(control.value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return { integer: { value: control.value } };
      }
      if (num < 0 || num > 9999) {
        return { integer4Range: { value: control.value } };
      }
      return null;
    };
  }

  // Validador para enteros de 5 dígitos (0-99999)
  static integer5Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const num = Number(control.value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return { integer: { value: control.value } };
      }
      if (num < 0 || num > 99999) {
        return { integer5Range: { value: control.value } };
      }
      return null;
    };
  }

  static maxLengthValidator(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      if (control.value.length > maxLength) {
        return { maxlength: { requiredLength: maxLength, actualLength: control.value.length } };
      }
      return null;
    };
  }

  static uppercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      if (control.value !== control.value.toUpperCase()) {
        return { uppercase: { value: control.value } };
      }
      return null;
    };
  }

  static naOrRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value === 'NA') return null;
      return Validators.required(control);
    };
  }

  static cedulaPasaporteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const tipoDoc = control.parent?.get('tipoDocumentoId')?.value;
      const value = control.value.toString().trim();
      
      // Si no hay tipoDocumentoId seleccionado, no validar formato aún
      if (!tipoDoc) return null;
      
      const tipoDocNum = Number(tipoDoc);
      if (tipoDocNum === 1) { // Cédula
        if (value.length !== 10 || !/^\d{10}$/.test(value)) {
          return { cedulaFormat: { value: control.value } };
        }
      } else if (tipoDocNum === 2) { // Pasaporte
        if (value.length !== 9 || !/^[A-Z0-9]{9}$/.test(value.toUpperCase())) {
          return { pasaporteFormat: { value: control.value } };
        }
      }
      return null;
    };
  }

  static dateFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(control.value)) {
        return { dateFormat: { value: control.value } };
      }
      const date = new Date(control.value);
      if (isNaN(date.getTime())) {
        return { dateInvalid: { value: control.value } };
      }
      return null;
    };
  }

  static tipoSangreValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = control.value.toString().trim().toUpperCase();
      const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validTypes.includes(value)) {
        return { tipoSangreInvalid: { value: control.value } };
      }
      if (value.length > 3) {
        return { maxlength: { requiredLength: 3, actualLength: value.length } };
      }
      return null;
    };
  }

  setupConditionalValidators(): void {
    // Validación condicional para discapacidad
    this.studentForm.get('discapacidad')?.valueChanges.subscribe(value => {
      const porcentaje = this.studentForm.get('porcentajeDiscapacidad');
      const carnet = this.studentForm.get('numCarnetConadis');
      const tipo = this.studentForm.get('tipoDiscapacidad');

      if (value === 2) {
        porcentaje?.setValue('NA');
        carnet?.setValue('NA');
        tipo?.setValue(7);
        porcentaje?.clearValidators();
        carnet?.clearValidators();
        tipo?.clearValidators();
      } else if (value === 1) {
        porcentaje?.setValidators([
          Validators.required,
          (control: AbstractControl) => {
            if (control.value === 'NA') return null;
            return StudentForm.integer3Validator()(control);
          }
        ]);
        carnet?.setValidators([
          Validators.required,
          (control: AbstractControl) => {
            if (control.value === 'NA') return null;
            if (control.value.length !== 7) {
              return { length: { requiredLength: 7, actualLength: control.value.length } };
            }
            return null;
          }
        ]);
        tipo?.setValidators([Validators.required, StudentForm.integer1Validator()]);
      }
      porcentaje?.updateValueAndValidity({ emitEvent: false });
      carnet?.updateValueAndValidity({ emitEvent: false });
      tipo?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para pueblonacionalidadId
    this.studentForm.get('etniaId')?.valueChanges.subscribe(value => {
      const pueblo = this.studentForm.get('pueblonacionalidadId');
      if (value === 1) {
        pueblo?.setValidators([Validators.required, StudentForm.integer2Validator()]);
      } else {
        pueblo?.setValue('NA');
        pueblo?.clearValidators();
      }
      pueblo?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para numeroIdentificacion según tipoDocumentoId
    this.studentForm.get('tipoDocumentoId')?.valueChanges.subscribe(() => {
      const numero = this.studentForm.get('numeroIdentificacion');
      numero?.updateValueAndValidity();
    });

    // Validación condicional para prácticas preprofesionales
    this.studentForm.get('haRealizadoPracticasPreprofesionales')?.valueChanges.subscribe(value => {
      const horas = this.studentForm.get('nroHorasPracticasPreprofesionalesPorPeriodo');
      const entorno = this.studentForm.get('entornoInstitucionalPracticasProfesionales');
      const sector = this.studentForm.get('sectorEconomicoPracticaProfesional');

      const valueNum = value ? Number(value) : null;

      if (valueNum === 2) {
        // Si no ha realizado prácticas
        horas?.setValue('NA', { emitEvent: false });
        entorno?.setValue(5, { emitEvent: false });
        sector?.setValue(22, { emitEvent: false });
        horas?.clearValidators();
        entorno?.clearValidators();
        sector?.clearValidators();
        horas?.disable({ emitEvent: false });
        entorno?.disable({ emitEvent: false });
        sector?.disable({ emitEvent: false });
      } else if (valueNum === 1) {
        // Si ha realizado prácticas
        horas?.enable({ emitEvent: false });
        entorno?.enable({ emitEvent: false });
        sector?.enable({ emitEvent: false });
        // Limpiar valores automáticos si existían
        if (horas?.value === 'NA') horas?.setValue('', { emitEvent: false });
        if (entorno?.value === 5) entorno?.setValue('', { emitEvent: false });
        if (sector?.value === 22) sector?.setValue('', { emitEvent: false });
        horas?.setValidators([
          Validators.required,
          (control: AbstractControl) => {
            if (!control.value || control.value === 'NA') return null;
            return StudentForm.integer3Validator()(control);
          }
        ]);
        entorno?.setValidators([Validators.required, StudentForm.integer1Validator()]);
        sector?.setValidators([Validators.required, StudentForm.integer2Validator()]);
      } else {
        // Si no hay valor seleccionado, habilitar campos pero sin validaciones
        horas?.enable({ emitEvent: false });
        entorno?.enable({ emitEvent: false });
        sector?.enable({ emitEvent: false });
        horas?.clearValidators();
        entorno?.clearValidators();
        sector?.clearValidators();
      }
      horas?.updateValueAndValidity({ emitEvent: false });
      entorno?.updateValueAndValidity({ emitEvent: false });
      sector?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para tipoBecaId = 5
    this.studentForm.get('tipoBecaId')?.valueChanges.subscribe(value => {
      const valueNum = value ? Number(value) : null;
      const primeraRazon = this.studentForm.get('primeraRazonBecaId');
      const segundaRazon = this.studentForm.get('segundaRazonBecaId');
      const terceraRazon = this.studentForm.get('terceraRazonBecaId');
      const cuartaRazon = this.studentForm.get('cuartaRazonBecaId');
      const quintaRazon = this.studentForm.get('quintaRazonBecaId');
      const sextaRazon = this.studentForm.get('sextaRazonBecaId');
      const montoBeca = this.studentForm.get('montoBeca');
      const porcientoArancel = this.studentForm.get('porcientoBecaCoberturaArancel');
      const porcientoManuntencion = this.studentForm.get('porcientoBecaCoberturaManuntencion');

      if (valueNum === 5) {
        // Si tipoBecaId = 5, establecer valores automáticos
        primeraRazon?.setValue('No aplica', { emitEvent: false });
        segundaRazon?.setValue('No aplica', { emitEvent: false });
        terceraRazon?.setValue('No aplica', { emitEvent: false });
        cuartaRazon?.setValue('No aplica', { emitEvent: false });
        quintaRazon?.setValue('No aplica', { emitEvent: false });
        sextaRazon?.setValue('No aplica', { emitEvent: false });
        montoBeca?.setValue('NA', { emitEvent: false });
        porcientoArancel?.setValue('NA', { emitEvent: false });
        porcientoManuntencion?.setValue('NA', { emitEvent: false });

        // Limpiar validadores y deshabilitar campos
        primeraRazon?.clearValidators();
        segundaRazon?.clearValidators();
        terceraRazon?.clearValidators();
        cuartaRazon?.clearValidators();
        quintaRazon?.clearValidators();
        sextaRazon?.clearValidators();
        montoBeca?.clearValidators();
        porcientoArancel?.clearValidators();
        porcientoManuntencion?.clearValidators();

        primeraRazon?.disable({ emitEvent: false });
        segundaRazon?.disable({ emitEvent: false });
        terceraRazon?.disable({ emitEvent: false });
        cuartaRazon?.disable({ emitEvent: false });
        quintaRazon?.disable({ emitEvent: false });
        sextaRazon?.disable({ emitEvent: false });
        montoBeca?.disable({ emitEvent: false });
        porcientoArancel?.disable({ emitEvent: false });
        porcientoManuntencion?.disable({ emitEvent: false });
      } else if (valueNum && valueNum !== 5) {
        // Si tipoBecaId tiene otro valor, habilitar campos y aplicar validaciones
        primeraRazon?.enable({ emitEvent: false });
        segundaRazon?.enable({ emitEvent: false });
        terceraRazon?.enable({ emitEvent: false });
        cuartaRazon?.enable({ emitEvent: false });
        quintaRazon?.enable({ emitEvent: false });
        sextaRazon?.enable({ emitEvent: false });
        montoBeca?.enable({ emitEvent: false });
        porcientoArancel?.enable({ emitEvent: false });
        porcientoManuntencion?.enable({ emitEvent: false });

        // Limpiar valores automáticos si existían
        if (primeraRazon?.value === 'No aplica') primeraRazon?.setValue('', { emitEvent: false });
        if (segundaRazon?.value === 'No aplica') segundaRazon?.setValue('', { emitEvent: false });
        if (terceraRazon?.value === 'No aplica') terceraRazon?.setValue('', { emitEvent: false });
        if (cuartaRazon?.value === 'No aplica') cuartaRazon?.setValue('', { emitEvent: false });
        if (quintaRazon?.value === 'No aplica') quintaRazon?.setValue('', { emitEvent: false });
        if (sextaRazon?.value === 'No aplica') sextaRazon?.setValue('', { emitEvent: false });
        if (montoBeca?.value === 'NA') montoBeca?.setValue('', { emitEvent: false });
        if (porcientoArancel?.value === 'NA') porcientoArancel?.setValue('', { emitEvent: false });
        if (porcientoManuntencion?.value === 'NA') porcientoManuntencion?.setValue('', { emitEvent: false });

        // Aplicar validaciones
        primeraRazon?.setValidators([StudentForm.integer1Validator()]);
        segundaRazon?.setValidators([StudentForm.integer4Validator()]);
        terceraRazon?.setValidators([StudentForm.integer1Validator()]);
        cuartaRazon?.setValidators([StudentForm.integer1Validator()]);
        quintaRazon?.setValidators([
          Validators.maxLength(10),
          (control: AbstractControl) => {
            if (!control.value || control.value === 'No aplica') return null;
            if (control.value.length > 10) {
              return { maxlength: { requiredLength: 10, actualLength: control.value.length } };
            }
            return null;
          }
        ]);
        sextaRazon?.setValidators([StudentForm.integer1Validator()]);
        montoBeca?.setValidators([
          (control: AbstractControl) => {
            if (!control.value || control.value === 'NA') return null;
            return StudentForm.integer5Validator()(control);
          }
        ]);
        porcientoArancel?.setValidators([
          (control: AbstractControl) => {
            if (!control.value || control.value === 'NA') return null;
            return StudentForm.integer3Validator()(control);
          }
        ]);
        porcientoManuntencion?.setValidators([
          (control: AbstractControl) => {
            if (!control.value || control.value === 'NA') return null;
            return StudentForm.integer3Validator()(control);
          }
        ]);
      } else {
        // Si no hay valor, habilitar campos pero sin validaciones
        primeraRazon?.enable({ emitEvent: false });
        segundaRazon?.enable({ emitEvent: false });
        terceraRazon?.enable({ emitEvent: false });
        cuartaRazon?.enable({ emitEvent: false });
        quintaRazon?.enable({ emitEvent: false });
        sextaRazon?.enable({ emitEvent: false });
        montoBeca?.enable({ emitEvent: false });
        porcientoArancel?.enable({ emitEvent: false });
        porcientoManuntencion?.enable({ emitEvent: false });
        primeraRazon?.clearValidators();
        segundaRazon?.clearValidators();
        terceraRazon?.clearValidators();
        cuartaRazon?.clearValidators();
        quintaRazon?.clearValidators();
        sextaRazon?.clearValidators();
        montoBeca?.clearValidators();
        porcientoArancel?.clearValidators();
        porcientoManuntencion?.clearValidators();
      }

      // Actualizar validaciones
      primeraRazon?.updateValueAndValidity({ emitEvent: false });
      segundaRazon?.updateValueAndValidity({ emitEvent: false });
      terceraRazon?.updateValueAndValidity({ emitEvent: false });
      cuartaRazon?.updateValueAndValidity({ emitEvent: false });
      quintaRazon?.updateValueAndValidity({ emitEvent: false });
      sextaRazon?.updateValueAndValidity({ emitEvent: false });
      montoBeca?.updateValueAndValidity({ emitEvent: false });
      porcientoArancel?.updateValueAndValidity({ emitEvent: false });
      porcientoManuntencion?.updateValueAndValidity({ emitEvent: false });
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      // CAMPOS 1-23 CON VALIDACIONES ESTRICTAS
      
      // 1. tipoDocumentoId (Entero 1, obligatorio)
      tipoDocumentoId: ['', [Validators.required, StudentForm.integer1Validator()]],

      // 2. numeroIdentificacion (Caracter 10 cédula / 9 pasaporte, obligatorio)
      numeroIdentificacion: ['', [Validators.required, StudentForm.cedulaPasaporteValidator()]],

      // 3. primerApellido (Caracter 60, MAYÚSCULAS, obligatorio)
      primerApellido: ['', [
        Validators.required,
        Validators.maxLength(60),
        StudentForm.uppercaseValidator()
      ]],

      // 4. segundoApellido (Caracter 60, obligatorio o "NA")
      segundoApellido: ['', [
        StudentForm.naOrRequiredValidator(),
        Validators.maxLength(60),
        (control: AbstractControl) => {
          if (control.value && control.value !== 'NA' && control.value.length > 60) {
            return { maxlength: { requiredLength: 60, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // 5. primerNombre (Caracter 60, MAYÚSCULAS, obligatorio)
      primerNombre: ['', [
        Validators.required,
        Validators.maxLength(60),
        StudentForm.uppercaseValidator()
      ]],

      // 6. segundoNombre (Caracter 60, obligatorio o "NA")
      segundoNombre: ['', [
        StudentForm.naOrRequiredValidator(),
        Validators.maxLength(60),
        (control: AbstractControl) => {
          if (control.value && control.value !== 'NA' && control.value.length > 60) {
            return { maxlength: { requiredLength: 60, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // 7. sexoId (Entero 1, obligatorio)
      sexoId: ['', [Validators.required, StudentForm.integer1Validator()]],

      // 8. generoId (Entero 1, obligatorio)
      generoId: ['', [Validators.required, StudentForm.integer1Validator()]],

      // 9. estadocivilId (Entero 1, obligatorio)
      estadocivilId: ['', [Validators.required, StudentForm.integer1Validator()]],

      // 10. etniaId (Entero 2, obligatorio)
      etniaId: ['', [Validators.required, StudentForm.integer2Validator()]],

      // 11. pueblonacionalidadId (Entero 2, obligatorio SOLO si etniaId = 1, si no NA)
      pueblonacionalidadId: [''],

      // 12. tipoSangre (Caracter 3, obligatorio)
      tipoSangre: ['', [
        Validators.required,
        Validators.maxLength(3),
        (control: AbstractControl) => {
          if (!control.value) return null;
          const value = control.value.toString().trim().toUpperCase();
          const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
          if (!validTypes.includes(value)) {
            return { tipoSangreInvalid: { value: control.value } };
          }
          return null;
        }
      ]],

      // DISCAPACIDAD
      // 13. discapacidad (Entero 1, obligatorio)
      discapacidad: ['', [Validators.required, StudentForm.integer1Validator()]],

      // 14. porcentajeDiscapacidad (Entero 3 o "NA")
      porcentajeDiscapacidad: [''],

      // 15. numCarnetConadis (Caracter 7 o "NA")
      numCarnetConadis: [''],

      // 16. tipoDiscapacidad (Entero 1)
      tipoDiscapacidad: [''],

      // FECHAS Y UBICACIÓN
      // 17. fechaNacimiento (yyyy-mm-dd, obligatorio)
      fechaNacimiento: ['', [
        Validators.required,
        StudentForm.dateFormatValidator()
      ]],

      // 18. paisNacionalidadId (Caracter 2, obligatorio)
      paisNacionalidadId: ['', [
        Validators.required,
        Validators.maxLength(2),
        Validators.minLength(2)
      ]],

      // 19. provinciaNacimientoId (Caracter 2 o "NA")
      provinciaNacimientoId: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          if (control.value.length !== 2) {
            return { length: { requiredLength: 2, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // 20. cantonNacimientoId (Caracter 4 o "NA")
      cantonNacimientoId: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          if (control.value.length !== 4) {
            return { length: { requiredLength: 4, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // 21. paisResidenciaId (Caracter 2, obligatorio)
      paisResidenciaId: ['', [
        Validators.required,
        Validators.maxLength(2),
        Validators.minLength(2)
      ]],

      // 22. provinciaResidenciaId (Caracter 2 o "NA")
      provinciaResidenciaId: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          if (control.value.length !== 2) {
            return { length: { requiredLength: 2, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // 23. cantonResidenciaId (Caracter 4 o "NA")
      cantonResidenciaId: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          if (control.value.length !== 4) {
            return { length: { requiredLength: 4, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // CAMPOS ACADÉMICOS (24-35)
      // 24. tipoColegioId (Entero 1)
      tipoColegioId: ['', [StudentForm.integer1Validator()]],

      // 25. modalidadCarrera (Entero 1)
      modalidadCarrera: ['', [StudentForm.integer1Validator()]],

      // 26. jornadaCarrera (Entero 1)
      jornadaCarrera: ['', [StudentForm.integer1Validator()]],

      // 27. fechaInicioCarrera (yyyy-mm-dd)
      fechaInicioCarrera: ['', [StudentForm.dateFormatValidator()]],

      // 28. fechaMatricula (yyyy-mm-dd)
      fechaMatricula: ['', [StudentForm.dateFormatValidator()]],

      // 29. tipoMatriculaId (Entero 1)
      tipoMatriculaId: ['', [StudentForm.integer1Validator()]],

      // 30. nivelAcademicoQueCursa (Entero 1)
      nivelAcademicoQueCursa: ['', [StudentForm.integer1Validator()]],

      // 31. duracionPeriodoAcademico (Entero 2)
      duracionPeriodoAcademico: ['', [StudentForm.integer2Validator()]],

      // 32. haRepetidoAlMenosUnaMateria (Entero 1)
      haRepetidoAlMenosUnaMateria: ['', [StudentForm.integer1Validator()]],

      // 33. paraleloId (Entero 2)
      paraleloId: ['', [StudentForm.integer2Validator()]],

      // 34. haPerdidoLaGratuidad (Entero 1)
      haPerdidoLaGratuidad: ['', [StudentForm.integer1Validator()]],

      // 35. recibePensionDiferenciada (Entero 1)
      recibePensionDiferenciada: ['', [StudentForm.integer1Validator()]],

      // CAMPOS ECONÓMICOS (36-38)
      // 36. estudianteocupacionId (Entero 1)
      estudianteocupacionId: ['', [StudentForm.integer1Validator()]],

      // 37. ingresosestudianteId (Entero 1)
      ingresosestudianteId: ['', [StudentForm.integer1Validator()]],

      // 38. bonodesarrolloId (Entero 1)
      bonodesarrolloId: ['', [StudentForm.integer1Validator()]],

      // CAMPOS PRÁCTICAS PREPROFESIONALES (39-42)
      // 39. haRealizadoPracticasPreprofesionales (Entero 1)
      haRealizadoPracticasPreprofesionales: ['', [StudentForm.integer1Validator()]],

      // 40. nroHorasPracticasPreprofesionalesPorPeriodo (Entero 3 o "NA")
      nroHorasPracticasPreprofesionalesPorPeriodo: [''],

      // 41. entornoInstitucionalPracticasProfesionales (Entero 1)
      entornoInstitucionalPracticasProfesionales: [''],

      // 42. sectorEconomicoPracticaProfesional (Entero 2)
      sectorEconomicoPracticaProfesional: [''],

      // CAMPOS BECAS (43-53)
      // 43. tipoBecaId (Entero 1)
      tipoBecaId: ['', [StudentForm.integer1Validator()]],

      // 44. primeraRazonBecaId (Entero 1)
      primeraRazonBecaId: ['', [StudentForm.integer1Validator()]],

      // 45. segundaRazonBecaId (Entero 4)
      segundaRazonBecaId: ['', [StudentForm.integer4Validator()]],

      // 46. terceraRazonBecaId (Entero 1)
      terceraRazonBecaId: ['', [StudentForm.integer1Validator()]],

      // 47. cuartaRazonBecaId (Entero 1)
      cuartaRazonBecaId: ['', [StudentForm.integer1Validator()]],

      // 48. quintaRazonBecaId (Caracter 10)
      quintaRazonBecaId: ['', [
        Validators.maxLength(10),
        (control: AbstractControl) => {
          if (!control.value || control.value === 'No aplica') return null;
          if (control.value.length > 10) {
            return { maxlength: { requiredLength: 10, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // 49. sextaRazonBecaId (Entero 1)
      sextaRazonBecaId: ['', [StudentForm.integer1Validator()]],

      // 50. montoBeca (Entero 5 o "NA")
      montoBeca: [''],

      // 51. porcientoBecaCoberturaArancel (Entero 3 o "NA")
      porcientoBecaCoberturaArancel: [''],

      // 52. porcientoBecaCoberturaManuntencion (Entero 3 o "NA")
      porcientoBecaCoberturaManuntencion: [''],

      // 53. financiamientoBeca (Entero 1 opcional)
      financiamientoBeca: ['', [StudentForm.integer1Validator()]],

      // CAMPOS AYUDAS (54-55)
      // 54. montoAyudaEconomica (Entero 5 o "NA")
      montoAyudaEconomica: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer5Validator()(control);
        }
      ]],

      // 55. montoCreditoEducativo (Entero 5 o "NA")
      montoCreditoEducativo: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer5Validator()(control);
        }
      ]],

      // CAMPOS VINCULACIÓN (56-57)
      // 56. participaEnProyectoVinculacionSociedad (Entero 1)
      participaEnProyectoVinculacionSociedad: ['', [StudentForm.integer1Validator()]],

      // 57. tipoAlcanceProyectoVinculacionId (Entero 1 opcional)
      tipoAlcanceProyectoVinculacionId: ['', [StudentForm.integer1Validator()]],

      // CAMPOS CONTACTO (58-59)
      // 58. correoElectronico (Caracter 30 o "NA")
      correoElectronico: ['', [
        Validators.maxLength(30),
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          if (control.value.length > 30) {
            return { maxlength: { requiredLength: 30, actualLength: control.value.length } };
          }
          // Validar formato de email si no es "NA"
          if (control.value && control.value !== 'NA') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(control.value)) {
              return { emailFormat: { value: control.value } };
            }
          }
          return null;
        }
      ]],

      // 59. numeroCelular (Caracter 10 o "0000000000")
      numeroCelular: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.minLength(10),
        (control: AbstractControl) => {
          if (!control.value) return null;
          const value = control.value.toString().trim();
          if (value.length !== 10) {
            return { length: { requiredLength: 10, actualLength: value.length } };
          }
          // Debe ser numérico o "0000000000"
          if (value !== '0000000000' && !/^\d{10}$/.test(value)) {
            return { numeric: { value: control.value } };
          }
          return null;
        }
      ]],

      // CAMPOS HOGAR (60-63)
      // 60. nivelFormacionPadre (Entero 1)
      nivelFormacionPadre: ['', [StudentForm.integer1Validator()]],

      // 61. nivelFormacionMadre (Entero 1)
      nivelFormacionMadre: ['', [StudentForm.integer1Validator()]],

      // 62. ingresoTotalHogar (Entero 4 o "NA")
      ingresoTotalHogar: ['', [
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer4Validator()(control);
        }
      ]],

      // 63. cantidadMiembrosHogar (Entero 2)
      cantidadMiembrosHogar: ['', [Validators.required, StudentForm.integer2Validator()]],

      // CAMPOS ADICIONALES (sin validaciones estrictas por ahora)
      fechaExpedicion: [''],
      lugarExpedicion: [''],
      lugarNacimiento: [''],
      foto: [''],
      nacionalidad: [''],
      paisNacimiento: [''],
      paisResidencia: [''],
      provinciaResidencia: [''],
      cantonResidencia: [''],
      parroquiaResidencia: [''],

      // SECCIÓN 5: Información académica (8 campos)
      nivelEducacion: [''],
      institucionEducativa: [''],
      tituloObtenido: [''],
      fechaGraduacion: [''],
      promedioNotas: [''],
      modalidadEstudio: [''],
      jornadaEstudio: [''],
      numeroMatricula: [''],

      // SECCIÓN 6: Información económica (6 campos)
      situacionLaboral: [''],
      nombreEmpresa: [''],
      cargoEmpresa: [''],
      ingresosMensuales: [''],
      tieneCuentaBancaria: [''],
      banco: [''],

    });
  }

  toggleSection(section: string): void {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formData = this.getFormDataForBackend();
      console.log('Formulario válido:', formData);
      // Aquí puedes enviar formData al backend
    } else {
      console.log('Formulario inválido');
      this.markFormGroupTouched(this.studentForm);
    }
  }

  getFormDataForBackend(): any {
    const formValue = this.studentForm.getRawValue();
    
    // Convertir valores string a números donde corresponda
    const data: any = {};
    
    // Campos numéricos
    const numericFields = [
      'tipoDocumentoId', 'sexoId', 'generoId', 'estadocivilId', 'etniaId',
      'pueblonacionalidadId', 'discapacidad', 'tipoDiscapacidad',
      'tipoColegioId', 'modalidadCarrera', 'jornadaCarrera', 'tipoMatriculaId',
      'nivelAcademicoQueCursa', 'duracionPeriodoAcademico', 'haRepetidoAlMenosUnaMateria',
      'paraleloId', 'haPerdidoLaGratuidad', 'recibePensionDiferenciada',
      'estudianteocupacionId', 'ingresosestudianteId', 'bonodesarrolloId',
      'haRealizadoPracticasPreprofesionales', 'entornoInstitucionalPracticasProfesionales',
      'sectorEconomicoPracticaProfesional', 'tipoBecaId', 'primeraRazonBecaId',
      'segundaRazonBecaId', 'terceraRazonBecaId', 'cuartaRazonBecaId', 'sextaRazonBecaId',
      'financiamientoBeca', 'participaEnProyectoVinculacionSociedad',
      'tipoAlcanceProyectoVinculacionId', 'nivelFormacionPadre', 'nivelFormacionMadre',
      'cantidadMiembrosHogar'
    ];

    numericFields.forEach(field => {
      if (formValue[field] !== '' && formValue[field] !== null && formValue[field] !== undefined) {
        data[field] = Number(formValue[field]);
      }
    });

    // Campos de texto que pueden ser "NA"
    const textFields = [
      'numeroIdentificacion', 'primerApellido', 'segundoApellido', 'primerNombre',
      'segundoNombre', 'tipoSangre', 'porcentajeDiscapacidad', 'numCarnetConadis',
      'fechaNacimiento', 'paisNacionalidadId', 'provinciaNacimientoId',
      'cantonNacimientoId', 'paisResidenciaId', 'provinciaResidenciaId',
      'cantonResidenciaId', 'fechaInicioCarrera', 'fechaMatricula',
      'nroHorasPracticasPreprofesionalesPorPeriodo', 'quintaRazonBecaId',
      'montoBeca', 'porcientoBecaCoberturaArancel', 'porcientoBecaCoberturaManuntencion',
      'montoAyudaEconomica', 'montoCreditoEducativo', 'correoElectronico',
      'numeroCelular', 'ingresoTotalHogar'
    ];

    textFields.forEach(field => {
      if (formValue[field] !== '' && formValue[field] !== null && formValue[field] !== undefined) {
        data[field] = formValue[field];
      }
    });

    return data;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.studentForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['integer'] || control.errors['integer1Range']) {
      return 'Debe ser un número entero válido';
    }
    if (control.errors['integer2Range']) {
      return 'Debe ser un número entero de 2 dígitos (1-99)';
    }
    if (control.errors['integer3Range']) {
      return 'Debe ser un número entero de 3 dígitos (0-999)';
    }
    if (control.errors['integer4Range']) {
      return 'Debe ser un número entero de 4 dígitos (0-9999)';
    }
    if (control.errors['integer5Range']) {
      return 'Debe ser un número entero de 5 dígitos (0-99999)';
    }
    if (control.errors['emailFormat']) {
      return 'Formato de correo electrónico inválido';
    }
    if (control.errors['numeric']) {
      return 'Debe contener solo números';
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['uppercase']) {
      return 'Debe estar en MAYÚSCULAS';
    }
    if (control.errors['cedulaFormat']) {
      return 'La cédula debe tener 10 dígitos numéricos';
    }
    if (control.errors['pasaporteFormat']) {
      return 'El pasaporte debe tener 9 caracteres alfanuméricos';
    }
    if (control.errors['dateFormat'] || control.errors['dateInvalid']) {
      return 'Formato de fecha inválido (yyyy-mm-dd)';
    }
    if (control.errors['tipoSangreInvalid']) {
      return 'Tipo de sangre inválido (ej: A+, B-, O+, etc.)';
    }
    if (control.errors['length']) {
      return `Debe tener exactamente ${control.errors['length'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }

  hasError(controlName: string): boolean {
    const control = this.studentForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
