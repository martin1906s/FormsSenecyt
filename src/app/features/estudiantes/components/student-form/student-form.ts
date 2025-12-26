import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsService, EnumsResponse } from '../../../../services/enums.service';
import { EstudianteService } from '../../../../services/estudiante.service';

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss',
})
export class StudentForm {
  enumsService = inject(EnumsService);
  estudianteService = inject(EstudianteService);
  enums: EnumsResponse | null = null;
  isSubmitting = false;
  submitMessage = '';
  submitError = false;

  // Propiedades para autocompletado de provincias y cantones
  filteredProvinciasNacimiento: string[] = [];
  filteredCantonesNacimiento: string[] = [];
  filteredProvinciasResidencia: string[] = [];
  filteredCantonesResidencia: string[] = [];
  
  // Propiedades para almacenar el texto de búsqueda temporal
  provinciaNacimientoSearch: string = '';
  cantonNacimientoSearch: string = '';
  provinciaResidenciaSearch: string = '';
  cantonResidenciaSearch: string = '';

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
    this.setupAutoUppercase();
    this.loadEnums();
  }

  // Configurar conversión automática a mayúsculas en campos de texto
  setupAutoUppercase(): void {
    // Campos que deben estar en mayúsculas
    const uppercaseFields = ['primerApellido', 'segundoApellido', 'primerNombre', 'segundoNombre'];
    
    uppercaseFields.forEach(fieldName => {
      const control = this.studentForm.get(fieldName);
      control?.valueChanges.subscribe((value: string) => {
        if (value && value !== 'NA') {
          const upperValue = value.toUpperCase();
          if (value !== upperValue) {
            control.setValue(upperValue, { emitEvent: false });
          }
        }
      });
    });
  }

  loadEnums() {
    this.enumsService.getEnums().subscribe({
      next: (enums: EnumsResponse) => {
        this.enums = enums;
        // Inicializar listas filtradas con todos los valores
        if (enums.Provincia) {
          this.filteredProvinciasNacimiento = [...enums.Provincia];
          this.filteredProvinciasResidencia = [...enums.Provincia];
        }
        if (enums.Canton) {
          this.filteredCantonesNacimiento = [...enums.Canton];
          this.filteredCantonesResidencia = [...enums.Canton];
        }
      },
      error: (err: any) => {
        console.error('Error fetching enums:', err);
      }
    });
  }

  // Métodos para filtrar provincias
  filterProvinciasNacimiento(searchTerm: string) {
    if (!this.enums?.Provincia) return;
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProvinciasNacimiento = [...this.enums.Provincia];
    } else {
      this.filteredProvinciasNacimiento = this.enums.Provincia.filter(provincia =>
        this.getEnumLabel(provincia).toLowerCase().includes(term) ||
        provincia.toLowerCase().includes(term)
      );
    }
  }

  filterProvinciasResidencia(searchTerm: string) {
    if (!this.enums?.Provincia) return;
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProvinciasResidencia = [...this.enums.Provincia];
    } else {
      this.filteredProvinciasResidencia = this.enums.Provincia.filter(provincia =>
        this.getEnumLabel(provincia).toLowerCase().includes(term) ||
        provincia.toLowerCase().includes(term)
      );
    }
  }

  // Métodos para filtrar cantones
  filterCantonesNacimiento(searchTerm: string) {
    if (!this.enums?.Canton) return;
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCantonesNacimiento = [...this.enums.Canton];
    } else {
      this.filteredCantonesNacimiento = this.enums.Canton.filter(canton =>
        this.getEnumLabel(canton).toLowerCase().includes(term) ||
        canton.toLowerCase().includes(term)
      );
    }
  }

  filterCantonesResidencia(searchTerm: string) {
    if (!this.enums?.Canton) return;
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCantonesResidencia = [...this.enums.Canton];
    } else {
      this.filteredCantonesResidencia = this.enums.Canton.filter(canton =>
        this.getEnumLabel(canton).toLowerCase().includes(term) ||
        canton.toLowerCase().includes(term)
      );
    }
  }

  // Método para seleccionar una provincia
  selectProvinciaNacimiento(provincia: string) {
    this.studentForm.get('provinciaNacimientoId')?.setValue(provincia);
    this.provinciaNacimientoSearch = this.getEnumLabel(provincia);
    this.filteredProvinciasNacimiento = [];
  }

  selectProvinciaResidencia(provincia: string) {
    this.studentForm.get('provinciaResidenciaId')?.setValue(provincia);
    this.provinciaResidenciaSearch = this.getEnumLabel(provincia);
    this.filteredProvinciasResidencia = [];
  }

  // Método para seleccionar un cantón
  selectCantonNacimiento(canton: string) {
    this.studentForm.get('cantonNacimientoId')?.setValue(canton);
    this.cantonNacimientoSearch = this.getEnumLabel(canton);
    this.filteredCantonesNacimiento = [];
  }

  selectCantonResidencia(canton: string) {
    this.studentForm.get('cantonResidenciaId')?.setValue(canton);
    this.cantonResidenciaSearch = this.getEnumLabel(canton);
    this.filteredCantonesResidencia = [];
  }

  // Métodos para manejar eventos de input
  onProvinciaNacimientoInput(event: any) {
    const value = event.target.value;
    this.provinciaNacimientoSearch = value;
    this.filterProvinciasNacimiento(value);
  }

  onProvinciaNacimientoBlur() {
    // Si hay un valor seleccionado, restaurar el texto al valor seleccionado
    const selectedValue = this.studentForm.get('provinciaNacimientoId')?.value;
    if (selectedValue) {
      this.provinciaNacimientoSearch = this.getEnumLabel(selectedValue);
    }
    // Delay para permitir el click en el dropdown
    setTimeout(() => {
      this.filteredProvinciasNacimiento = [];
    }, 200);
  }

  onCantonNacimientoInput(event: any) {
    const value = event.target.value;
    this.cantonNacimientoSearch = value;
    this.filterCantonesNacimiento(value);
  }

  onCantonNacimientoBlur() {
    const selectedValue = this.studentForm.get('cantonNacimientoId')?.value;
    if (selectedValue) {
      this.cantonNacimientoSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredCantonesNacimiento = [];
    }, 200);
  }

  onProvinciaResidenciaInput(event: any) {
    const value = event.target.value;
    this.provinciaResidenciaSearch = value;
    this.filterProvinciasResidencia(value);
  }

  onProvinciaResidenciaBlur() {
    const selectedValue = this.studentForm.get('provinciaResidenciaId')?.value;
    if (selectedValue) {
      this.provinciaResidenciaSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredProvinciasResidencia = [];
    }, 200);
  }

  onCantonResidenciaInput(event: any) {
    const value = event.target.value;
    this.cantonResidenciaSearch = value;
    this.filterCantonesResidencia(value);
  }

  onCantonResidenciaBlur() {
    const selectedValue = this.studentForm.get('cantonResidenciaId')?.value;
    if (selectedValue) {
      this.cantonResidenciaSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredCantonesResidencia = [];
    }, 200);
  }

  // Método auxiliar para obtener etiquetas más amigables de los enums
  getEnumLabel(enumValue: string): string {
    if (!enumValue) return '';
    return enumValue
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
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


  setupConditionalValidators(): void {
    // Validación condicional para discapacidad
    // Validación condicional para campos de discapacidad
    // Si discapacidad = "NO", los demás campos se deshabilitan y se establecen valores por defecto
    this.studentForm.get('discapacidad')?.valueChanges.subscribe((value: any) => {
      const porcentaje = this.studentForm.get('porcentajeDiscapacidad');
      const carnet = this.studentForm.get('numCarnetConadis');
      const tipo = this.studentForm.get('tipoDiscapacidad');

      if (value === 'NO') {
        // Si no tiene discapacidad, establecer valores por defecto y deshabilitar campos
        porcentaje?.setValue('NA', { emitEvent: false });
        carnet?.setValue('NA', { emitEvent: false });
        tipo?.setValue('NO_APLICA', { emitEvent: false });
        porcentaje?.disable({ emitEvent: false });
        carnet?.disable({ emitEvent: false });
        tipo?.disable({ emitEvent: false });
        porcentaje?.clearValidators();
        carnet?.clearValidators();
        tipo?.clearValidators();
      } else if (value === 'SI') {
        // Si tiene discapacidad, habilitar campos y establecer validadores
        porcentaje?.enable({ emitEvent: false });
        carnet?.enable({ emitEvent: false });
        tipo?.enable({ emitEvent: false });
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
            if (control.value && control.value.length !== 7) {
              return { length: { requiredLength: 7, actualLength: control.value.length } };
            }
            return null;
          }
        ]);
        tipo?.setValidators([Validators.required]);
      } else {
        // Si no hay valor seleccionado, habilitar campos pero sin validadores
        porcentaje?.enable({ emitEvent: false });
        carnet?.enable({ emitEvent: false });
        tipo?.enable({ emitEvent: false });
        porcentaje?.clearValidators();
        carnet?.clearValidators();
        tipo?.clearValidators();
      }
      porcentaje?.updateValueAndValidity({ emitEvent: false });
      carnet?.updateValueAndValidity({ emitEvent: false });
      tipo?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para pueblonacionalidadId
    // Solo se habilita si etniaId = "INDIGENA", si no se establece automáticamente "NO_APLICA"
    this.studentForm.get('etniaId')?.valueChanges.subscribe((value: any) => {
      const pueblo = this.studentForm.get('pueblonacionalidadId');
      if (value === 'INDIGENA') {
        // Si es indígena, habilitar el campo y requerir selección
        pueblo?.enable({ emitEvent: false });
        pueblo?.setValidators([Validators.required]);
        pueblo?.setValue('', { emitEvent: false });
      } else {
        // Si no es indígena, establecer automáticamente "NO_APLICA" y deshabilitar
        pueblo?.setValue('NO_APLICA', { emitEvent: false });
        pueblo?.disable({ emitEvent: false });
        pueblo?.clearValidators();
      }
      pueblo?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para provincias y cantones de nacimiento
    // Solo se habilitan si paisNacionalidadId = "ECUADOR"
    this.studentForm.get('paisNacionalidadId')?.valueChanges.subscribe((value: any) => {
      const provinciaNacimiento = this.studentForm.get('provinciaNacimientoId');
      const cantonNacimiento = this.studentForm.get('cantonNacimientoId');
      
      if (value === 'ECUADOR') {
        // Si el país es Ecuador, habilitar campos
        provinciaNacimiento?.enable({ emitEvent: false });
        cantonNacimiento?.enable({ emitEvent: false });
      } else {
        // Si el país no es Ecuador, deshabilitar y limpiar valores
        provinciaNacimiento?.setValue('', { emitEvent: false });
        cantonNacimiento?.setValue('', { emitEvent: false });
        provinciaNacimiento?.disable({ emitEvent: false });
        cantonNacimiento?.disable({ emitEvent: false });
        provinciaNacimiento?.clearValidators();
        cantonNacimiento?.clearValidators();
        // Limpiar valores de búsqueda
        this.provinciaNacimientoSearch = '';
        this.cantonNacimientoSearch = '';
        this.filteredProvinciasNacimiento = [];
        this.filteredCantonesNacimiento = [];
      }
      provinciaNacimiento?.updateValueAndValidity({ emitEvent: false });
      cantonNacimiento?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para provincias y cantones de residencia
    // Solo se habilitan si paisResidenciaId = "ECUADOR"
    this.studentForm.get('paisResidenciaId')?.valueChanges.subscribe((value: any) => {
      const provinciaResidencia = this.studentForm.get('provinciaResidenciaId');
      const cantonResidencia = this.studentForm.get('cantonResidenciaId');
      
      if (value === 'ECUADOR') {
        // Si el país es Ecuador, habilitar campos
        provinciaResidencia?.enable({ emitEvent: false });
        cantonResidencia?.enable({ emitEvent: false });
        provinciaResidencia?.setValidators([Validators.required]);
        cantonResidencia?.setValidators([Validators.required]);
      } else {
        // Si el país no es Ecuador, deshabilitar y limpiar valores
        provinciaResidencia?.setValue('', { emitEvent: false });
        cantonResidencia?.setValue('', { emitEvent: false });
        provinciaResidencia?.disable({ emitEvent: false });
        cantonResidencia?.disable({ emitEvent: false });
        provinciaResidencia?.clearValidators();
        cantonResidencia?.clearValidators();
        // Limpiar valores de búsqueda
        this.provinciaResidenciaSearch = '';
        this.cantonResidenciaSearch = '';
        this.filteredProvinciasResidencia = [];
        this.filteredCantonesResidencia = [];
      }
      provinciaResidencia?.updateValueAndValidity({ emitEvent: false });
      cantonResidencia?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para ingresosestudianteId
    // Si estudianteocupacionId = "SOLO_ESTUDIA", ingresosestudianteId debe ser "NO_APLICA"
    this.studentForm.get('estudianteocupacionId')?.valueChanges.subscribe((value: any) => {
      const ingresos = this.studentForm.get('ingresosestudianteId');
      if (value === 'SOLO_ESTUDIA') {
        // Si solo estudia, establecer automáticamente "NO_APLICA"
        ingresos?.setValue('NO_APLICA', { emitEvent: false });
        ingresos?.disable({ emitEvent: false });
      } else if (value === 'TRABAJA_Y_ESTUDIA') {
        // Si trabaja y estudia, habilitar y requerir
        ingresos?.enable({ emitEvent: false });
        ingresos?.setValidators([Validators.required]);
        if (ingresos?.value === 'NO_APLICA') ingresos?.setValue('', { emitEvent: false });
      } else {
        ingresos?.enable({ emitEvent: false });
        ingresos?.setValidators([Validators.required]);
      }
      ingresos?.updateValueAndValidity({ emitEvent: false });
    });

    // Validación condicional para numeroIdentificacion según tipoDocumentoId
    this.studentForm.get('tipoDocumentoId')?.valueChanges.subscribe(() => {
      const numero = this.studentForm.get('numeroIdentificacion');
      numero?.updateValueAndValidity();
    });

    // Validación condicional para prácticas preprofesionales
    this.studentForm.get('haRealizadoPracticasPreprofesionales')?.valueChanges.subscribe((value: any) => {
      const horas = this.studentForm.get('nroHorasPracticasPreprofesionalesPorPeriodo');
      const entorno = this.studentForm.get('entornoInstitucionalPracticasProfesionales');
      const sector = this.studentForm.get('sectorEconomicoPracticaProfesional');

      if (value === 'NO') {
        // Si no ha realizado prácticas, establecer valores automáticos pero mantener campos habilitados
        horas?.setValue('NA', { emitEvent: false });
        entorno?.setValue('NO_APLICA', { emitEvent: false });
        sector?.setValue('NO_APLICA', { emitEvent: false });
        horas?.enable({ emitEvent: false });
        entorno?.enable({ emitEvent: false });
        sector?.enable({ emitEvent: false });
        // Mantener validadores ya que los campos son obligatorios
        horas?.setValidators([Validators.required]);
        entorno?.setValidators([Validators.required]);
        sector?.setValidators([Validators.required]);
      } else if (value === 'SI') {
        // Si ha realizado prácticas
        horas?.enable({ emitEvent: false });
        entorno?.enable({ emitEvent: false });
        sector?.enable({ emitEvent: false });
        // Limpiar valores automáticos si existían
        if (horas?.value === 'NA') horas?.setValue('', { emitEvent: false });
        if (entorno?.value === 'NO_APLICA') entorno?.setValue('', { emitEvent: false });
        if (sector?.value === 'NO_APLICA') sector?.setValue('', { emitEvent: false });
        horas?.setValidators([
          Validators.required,
          (control: AbstractControl) => {
            if (!control.value || control.value === 'NA') return null;
            return StudentForm.integer3Validator()(control);
          }
        ]);
        entorno?.setValidators([Validators.required]);
        sector?.setValidators([Validators.required]);
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

    // Validación condicional para tipoBecaId = "NO_APLICA"
    this.studentForm.get('tipoBecaId')?.valueChanges.subscribe((value: any) => {
      const primeraRazon = this.studentForm.get('primeraRazonBecaId');
      const segundaRazon = this.studentForm.get('segundaRazonBecaId');
      const terceraRazon = this.studentForm.get('terceraRazonBecaId');
      const cuartaRazon = this.studentForm.get('cuartaRazonBecaId');
      const quintaRazon = this.studentForm.get('quintaRazonBecaId');
      const sextaRazon = this.studentForm.get('sextaRazonBecaId');
      const montoBeca = this.studentForm.get('montoBeca');
      const porcientoArancel = this.studentForm.get('porcientoBecaCoberturaArancel');
      const porcientoManuntencion = this.studentForm.get('porcientoBecaCoberturaManuntencion');

      if (value === 'NO_APLICA') {
        // Si tipoBecaId = "NO_APLICA", establecer valores automáticos
        primeraRazon?.setValue('NO_APLICA', { emitEvent: false });
        segundaRazon?.setValue('NO_APLICA', { emitEvent: false });
        terceraRazon?.setValue('NO_APLICA', { emitEvent: false });
        cuartaRazon?.setValue('NO_APLICA', { emitEvent: false });
        quintaRazon?.setValue('NO_APLICA', { emitEvent: false });
        sextaRazon?.setValue('NO_APLICA', { emitEvent: false });
        montoBeca?.setValue('NA', { emitEvent: false });
        porcientoArancel?.setValue('0', { emitEvent: false });
        porcientoManuntencion?.setValue('0', { emitEvent: false });

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
      } else if (value && value !== 'NO_APLICA') {
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
        if (primeraRazon?.value === 'NO_APLICA') primeraRazon?.setValue('', { emitEvent: false });
        if (segundaRazon?.value === 'NO_APLICA') segundaRazon?.setValue('', { emitEvent: false });
        if (terceraRazon?.value === 'NO_APLICA') terceraRazon?.setValue('', { emitEvent: false });
        if (cuartaRazon?.value === 'NO_APLICA') cuartaRazon?.setValue('', { emitEvent: false });
        if (quintaRazon?.value === 'NO_APLICA') quintaRazon?.setValue('', { emitEvent: false });
        if (sextaRazon?.value === 'NO_APLICA') sextaRazon?.setValue('', { emitEvent: false });
        if (montoBeca?.value === 'NA') montoBeca?.setValue('', { emitEvent: false });
        if (porcientoArancel?.value === '0') porcientoArancel?.setValue('', { emitEvent: false });
        if (porcientoManuntencion?.value === '0') porcientoManuntencion?.setValue('', { emitEvent: false });

        // Aplicar validaciones
        primeraRazon?.setValidators([Validators.required]);
        segundaRazon?.setValidators([Validators.required]);
        terceraRazon?.setValidators([Validators.required]);
        cuartaRazon?.setValidators([Validators.required]);
        quintaRazon?.setValidators([Validators.required]);
        sextaRazon?.setValidators([Validators.required]);
        montoBeca?.setValidators([
          Validators.required,
          (control: AbstractControl) => {
            if (!control.value || control.value === 'NA') return null;
            return StudentForm.integer5Validator()(control);
          }
        ]);
        porcientoArancel?.setValidators([
          Validators.required,
          (control: AbstractControl) => {
            if (!control.value || control.value === 'NA') return null;
            return StudentForm.integer3Validator()(control);
          }
        ]);
        porcientoManuntencion?.setValidators([
          Validators.required,
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

      // 1. tipoDocumentoId (Enum, obligatorio)
      tipoDocumentoId: ['', [Validators.required]],

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

      // 7. sexoId (Enum, obligatorio)
      sexoId: ['', [Validators.required]],

      // 8. generoId (Enum, obligatorio)
      generoId: ['', [Validators.required]],

      // 9. estadocivilId (Enum, obligatorio)
      estadocivilId: ['', [Validators.required]],

      // 10. etniaId (Enum, obligatorio)
      etniaId: ['', [Validators.required]],

      // 11. pueblonacionalidadId (Enum, obligatorio SOLO si etniaId = "INDIGENA", si no "NO_APLICA")
      pueblonacionalidadId: [{ value: '', disabled: false }],

      // 12. tipoSangre (Enum, obligatorio)
      tipoSangre: ['', [Validators.required]],

      // DISCAPACIDAD
      // 13. discapacidad (Enum, obligatorio)
      discapacidad: ['', [Validators.required]],

      // 14. porcentajeDiscapacidad (Entero 3 o "NA", obligatorio si discapacidad = "SI")
      porcentajeDiscapacidad: [{ value: '', disabled: false }],

      // 15. numCarnetConadis (Caracter 7 o "NA", obligatorio si discapacidad = "SI")
      numCarnetConadis: [{ value: '', disabled: false }],

      // 16. tipoDiscapacidad (Enum, obligatorio si discapacidad = "SI")
      tipoDiscapacidad: [{ value: '', disabled: false }],

      // FECHAS Y UBICACIÓN
      // 17. fechaNacimiento (yyyy-mm-dd, obligatorio)
      fechaNacimiento: ['', [
        Validators.required,
        StudentForm.dateFormatValidator()
      ]],

      // 18. paisNacionalidadId (Enum, obligatorio)
      paisNacionalidadId: ['', [Validators.required]],

      // 19. provinciaNacimientoId (Enum, opcional si país no es Ecuador)
      provinciaNacimientoId: [{ value: '', disabled: true }],

      // 20. cantonNacimientoId (Enum, obligatorio si país es Ecuador)
      cantonNacimientoId: [{ value: '', disabled: true }],

      // 21. paisResidenciaId (Enum, obligatorio)
      paisResidenciaId: ['', [Validators.required]],

      // 22. provinciaResidenciaId (Enum, obligatorio si país es Ecuador)
      provinciaResidenciaId: [{ value: '', disabled: true }, [Validators.required]],

      // 23. cantonResidenciaId (Enum, obligatorio si país es Ecuador)
      cantonResidenciaId: [{ value: '', disabled: true }, [Validators.required]],

      // CAMPOS ACADÉMICOS (24-35)
      // 24. tipoColegioId (Enum) - obligatorio
      tipoColegioId: ['', [Validators.required]],

      // 25. modalidadCarrera (Enum) - obligatorio
      modalidadCarrera: ['', [Validators.required]],

      // 26. jornadaCarrera (Enum) - obligatorio
      jornadaCarrera: ['', [Validators.required]],

      // 27. fechaInicioCarrera (yyyy-mm-dd) - obligatorio
      fechaInicioCarrera: ['', [Validators.required, StudentForm.dateFormatValidator()]],

      // 28. fechaMatricula (yyyy-mm-dd) - obligatorio
      fechaMatricula: ['', [Validators.required, StudentForm.dateFormatValidator()]],

      // 29. tipoMatriculaId (Enum) - obligatorio
      tipoMatriculaId: ['', [Validators.required]],

      // 30. nivelAcademicoQueCursa (Enum) - obligatorio
      nivelAcademicoQueCursa: ['', [Validators.required]],

      // 31. duracionPeriodoAcademico (Entero 2) - obligatorio
      duracionPeriodoAcademico: ['', [Validators.required, StudentForm.integer2Validator()]],

      // 32. haRepetidoAlMenosUnaMateria (Enum) - obligatorio
      haRepetidoAlMenosUnaMateria: ['', [Validators.required]],

      // 33. paraleloId (Enum) - obligatorio
      paraleloId: ['', [Validators.required]],

      // 34. haPerdidoLaGratuidad (Enum) - obligatorio
      haPerdidoLaGratuidad: ['', [Validators.required]],

      // 35. recibePensionDiferenciada (Enum) - obligatorio
      recibePensionDiferenciada: ['', [Validators.required]],

      // CAMPOS ECONÓMICOS (36-38)
      // 36. estudianteocupacionId (Enum) - obligatorio
      estudianteocupacionId: ['', [Validators.required]],

      // 37. ingresosestudianteId (Enum) - obligatorio (debe ser NO_APLICA si 36=SOLO_ESTUDIA)
      ingresosestudianteId: ['', [Validators.required]],

      // 38. bonodesarrolloId (Enum) - obligatorio
      bonodesarrolloId: ['', [Validators.required]],

      // CAMPOS PRÁCTICAS PREPROFESIONALES (39-42)
      // 39. haRealizadoPracticasPreprofesionales (Enum) - obligatorio
      haRealizadoPracticasPreprofesionales: ['', [Validators.required]],

      // 40. nroHorasPracticasPreprofesionalesPorPeriodo (Entero 3 o "NA") - obligatorio
      nroHorasPracticasPreprofesionalesPorPeriodo: ['', [Validators.required]],

      // 41. entornoInstitucionalPracticasProfesionales (Enum) - obligatorio
      entornoInstitucionalPracticasProfesionales: ['', [Validators.required]],

      // 42. sectorEconomicoPracticaProfesional (Enum) - obligatorio
      sectorEconomicoPracticaProfesional: ['', [Validators.required]],

      // CAMPOS BECAS (43-53)
      // 43. tipoBecaId (Enum) - obligatorio
      tipoBecaId: ['', [Validators.required]],

      // 44. primeraRazonBecaId (Enum) - obligatorio
      primeraRazonBecaId: ['', [Validators.required]],

      // 45. segundaRazonBecaId (Enum) - obligatorio
      segundaRazonBecaId: ['', [Validators.required]],

      // 46. terceraRazonBecaId (Enum) - obligatorio
      terceraRazonBecaId: ['', [Validators.required]],

      // 47. cuartaRazonBecaId (Enum) - obligatorio
      cuartaRazonBecaId: ['', [Validators.required]],

      // 48. quintaRazonBecaId (Enum) - obligatorio
      quintaRazonBecaId: ['', [Validators.required]],

      // 49. sextaRazonBecaId (Enum) - obligatorio
      sextaRazonBecaId: ['', [Validators.required]],

      // 50. montoBeca (Entero 5 o "NA") - obligatorio
      montoBeca: ['', [
        Validators.required,
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer5Validator()(control);
        }
      ]],

      // 51. porcientoBecaCoberturaArancel (Entero 3 o "NA") - obligatorio
      porcientoBecaCoberturaArancel: ['', [
        Validators.required,
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer3Validator()(control);
        }
      ]],

      // 52. porcientoBecaCoberturaManuntencion (Entero 3 o "NA") - obligatorio
      porcientoBecaCoberturaManuntencion: ['', [
        Validators.required,
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer3Validator()(control);
        }
      ]],

      // 53. financiamientoBeca (Enum opcional) - opcional según documentación
      financiamientoBeca: [''],

      // CAMPOS AYUDAS (54-55)
      // 54. montoAyudaEconomica (Entero 5 o "NA") - obligatorio
      montoAyudaEconomica: ['', [
        Validators.required,
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer5Validator()(control);
        }
      ]],

      // 55. montoCreditoEducativo (Entero 5 o "NA") - obligatorio
      montoCreditoEducativo: ['', [
        Validators.required,
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          return StudentForm.integer5Validator()(control);
        }
      ]],

      // CAMPOS VINCULACIÓN (56-57)
      // 56. participaEnProyectoVinculacionSociedad (Enum) - obligatorio
      participaEnProyectoVinculacionSociedad: ['', [Validators.required]],

      // 57. tipoAlcanceProyectoVinculacionId (Enum opcional) - opcional según documentación
      tipoAlcanceProyectoVinculacionId: [''],

      // CAMPOS CONTACTO (58-59)
      // 58. correoElectronico (Caracter variable o "NA") - obligatorio
      correoElectronico: ['', [
        Validators.required,
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
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
      // 60. nivelFormacionPadre (Enum) - obligatorio
      nivelFormacionPadre: ['', [Validators.required]],

      // 61. nivelFormacionMadre (Enum) - obligatorio
      nivelFormacionMadre: ['', [Validators.required]],

      // 62. ingresoTotalHogar (Entero variable o "NA") - obligatorio
      ingresoTotalHogar: ['', [
        Validators.required,
        (control: AbstractControl) => {
          if (!control.value || control.value === 'NA') return null;
          // Validar que sea un número entero positivo (sin límite de dígitos)
          const num = Number(control.value);
          if (isNaN(num) || !Number.isInteger(num) || num < 0) {
            return { numeric: { value: control.value } };
          }
          return null;
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
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitError = false;
      
      const formData = this.getFormDataForBackend();
      console.log('Formulario válido, enviando:', formData);
      
      this.estudianteService.createEstudiante(formData).subscribe({
        next: (response) => {
          console.log('Estudiante creado exitosamente:', response);
          this.submitMessage = 'Estudiante registrado exitosamente';
          this.submitError = false;
          this.isSubmitting = false;
          // Opcional: resetear el formulario
          // this.studentForm.reset();
        },
        error: (error) => {
          console.error('Error al crear estudiante:', error);
          this.submitMessage = error.error?.message || 'Error al registrar el estudiante. Por favor, intenta nuevamente.';
          this.submitError = true;
          this.isSubmitting = false;
        }
      });
    } else {
      console.log('Formulario inválido');
      this.markFormGroupTouched(this.studentForm);
      const camposConErrores = this.getCamposConErrores();
      if (camposConErrores.length > 0) {
        this.submitMessage = `Por favor, completa correctamente los siguientes campos:\n\n${camposConErrores.join('\n')}`;
      } else {
        this.submitMessage = 'Por favor, completa todos los campos requeridos correctamente';
      }
      this.submitError = true;
    }
  }

  getCamposConErrores(): string[] {
    const camposConErrores: string[] = [];
    const nombresCampos: { [key: string]: string } = {
      tipoDocumentoId: 'Tipo de Documento',
      numeroIdentificacion: 'Número de Identificación',
      primerApellido: 'Primer Apellido',
      segundoApellido: 'Segundo Apellido',
      primerNombre: 'Primer Nombre',
      segundoNombre: 'Segundo Nombre',
      sexoId: 'Sexo',
      generoId: 'Género',
      estadocivilId: 'Estado Civil',
      etniaId: 'Etnia',
      pueblonacionalidadId: 'Pueblo y Nacionalidad',
      tipoSangre: 'Tipo de Sangre',
      discapacidad: 'Discapacidad',
      porcentajeDiscapacidad: 'Porcentaje de Discapacidad',
      numCarnetConadis: 'Número Carnet CONADIS',
      tipoDiscapacidad: 'Tipo de Discapacidad',
      fechaNacimiento: 'Fecha de Nacimiento',
      paisNacionalidadId: 'País Nacionalidad',
      provinciaNacimientoId: 'Provincia de Nacimiento',
      cantonNacimientoId: 'Cantón de Nacimiento',
      paisResidenciaId: 'País Residencia',
      provinciaResidenciaId: 'Provincia de Residencia',
      cantonResidenciaId: 'Cantón de Residencia',
      tipoColegioId: 'Tipo Colegio',
      modalidadCarrera: 'Modalidad Carrera',
      jornadaCarrera: 'Jornada Carrera',
      fechaInicioCarrera: 'Fecha Inicio Carrera',
      fechaMatricula: 'Fecha Matrícula',
      tipoMatriculaId: 'Tipo Matrícula',
      nivelAcademicoQueCursa: 'Nivel Académico que Cursa',
      duracionPeriodoAcademico: 'Duración Periodo Académico',
      haRepetidoAlMenosUnaMateria: '¿Ha Repetido al Menos Una Materia?',
      paraleloId: 'Paralelo',
      haPerdidoLaGratuidad: '¿Ha Perdido la Gratuidad?',
      recibePensionDiferenciada: '¿Recibe Pensión Diferenciada?',
      estudianteocupacionId: 'Estudiante Dedicado',
      ingresosestudianteId: 'Empleación de Ingresos del Estudiante',
      bonodesarrolloId: 'Bono Desarrollo Humano',
      haRealizadoPracticasPreprofesionales: '¿Ha Realizado Prácticas Preprofesionales?',
      nroHorasPracticasPreprofesionalesPorPeriodo: 'Número Horas Prácticas por Periodo',
      entornoInstitucionalPracticasProfesionales: 'Entorno Institucional Prácticas Profesionales',
      sectorEconomicoPracticaProfesional: 'Sector Económico Práctica Profesional',
      tipoBecaId: 'Tipo Beca',
      primeraRazonBecaId: 'Primera Razón Beca',
      segundaRazonBecaId: 'Segunda Razón Beca',
      terceraRazonBecaId: 'Tercera Razón Beca',
      cuartaRazonBecaId: 'Cuarta Razón Beca',
      quintaRazonBecaId: 'Quinta Razón Beca',
      sextaRazonBecaId: 'Sexta Razón Beca',
      montoBeca: 'Monto Beca',
      porcientoBecaCoberturaArancel: 'Porciento Beca Cobertura Arancel',
      porcientoBecaCoberturaManuntencion: 'Porciento Beca Cobertura Manutención',
      financiamientoBeca: 'Financiamiento Beca',
      montoAyudaEconomica: 'Monto Ayuda Económica',
      montoCreditoEducativo: 'Monto Crédito Educativo',
      participaEnProyectoVinculacionSociedad: '¿Participa en Proyecto Vinculación Sociedad?',
      tipoAlcanceProyectoVinculacionId: 'Tipo Alcance Proyecto Vinculación',
      correoElectronico: 'Correo Electrónico',
      numeroCelular: 'Número Celular',
      nivelFormacionPadre: 'Nivel Formación Padre',
      nivelFormacionMadre: 'Nivel Formación Madre',
      ingresoTotalHogar: 'Ingreso Total Hogar',
      cantidadMiembrosHogar: 'Cantidad Miembros Hogar',
      periodoAcademicoId: 'Periodo Académico'
    };

    Object.keys(this.studentForm.controls).forEach(key => {
      const control = this.studentForm.get(key);
      // Verificar campos inválidos (touched o no, pero que tienen errores)
      if (control && control.invalid) {
        const nombreCampo = nombresCampos[key] || key;
        // Obtener el mensaje de error (ahora también funciona sin touched)
        const error = this.getErrorMessageForField(key);
        if (error) {
          camposConErrores.push(`• ${nombreCampo}: ${error}`);
        } else if (control.errors?.['required']) {
          camposConErrores.push(`• ${nombreCampo}: Este campo es obligatorio`);
        } else {
          camposConErrores.push(`• ${nombreCampo}: Campo inválido`);
        }
      }
    });

    return camposConErrores;
  }

  getErrorMessageForField(controlName: string): string {
    const control = this.studentForm.get(controlName);
    if (!control || !control.errors) return '';

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
    if (control.errors['length']) {
      return `Debe tener exactamente ${control.errors['length'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }

  getFormDataForBackend(): any {
    const formValue = this.studentForm.getRawValue();
    
    // Construir objeto de datos con solo los campos esperados por el backend
    // IMPORTANTE: Los valores de enum ya están en el formulario (no IDs numéricos)
    const data: any = {
      // Campos enum obligatorios - los valores ya son enums del formulario
      tipoDocumento: formValue.tipoDocumentoId || '',
      sexo: formValue.sexoId || '',
      genero: formValue.generoId || '',
      estadoCivil: formValue.estadocivilId || '',
      etnia: formValue.etniaId || '',
      puebloNacionalidad: formValue.pueblonacionalidadId || 'NO_APLICA',
      tipoSangre: formValue.tipoSangre || '',
      discapacidad: formValue.discapacidad || '',
      
      // Campos de discapacidad
      porcentajeDiscapacidad: formValue.porcentajeDiscapacidad || 'NA',
      numCarnetConadis: formValue.numCarnetConadis || 'NA',
      tipoDiscapacidad: formValue.tipoDiscapacidad || 'NO_APLICA',
      
      // Campos de texto obligatorios
      numeroIdentificacion: formValue.numeroIdentificacion || '',
      primerApellido: formValue.primerApellido || '',
      segundoApellido: formValue.segundoApellido || 'NA',
      primerNombre: formValue.primerNombre || '',
      segundoNombre: formValue.segundoNombre || 'NA',
      fechaNacimiento: formValue.fechaNacimiento || '',
      
      // Campos de ubicación
      paisNacionalidadId: formValue.paisNacionalidadId || '',
      provinciaNacimientoId: formValue.provinciaNacimientoId || undefined,
      cantonNacimientoId: formValue.cantonNacimientoId || '',
      paisResidenciaId: formValue.paisResidenciaId || '',
      provinciaResidenciaId: formValue.provinciaResidenciaId || '',
      cantonResidenciaId: formValue.cantonResidenciaId || '',
      
      // Campos académicos - convertir a enum si es necesario
      tipoColegioId: formValue.tipoColegioId || '',
      modalidadCarrera: formValue.modalidadCarrera || '',
      jornadaCarrera: formValue.jornadaCarrera || '',
      fechaInicioCarrera: formValue.fechaInicioCarrera || '',
      fechaMatricula: formValue.fechaMatricula || '',
      tipoMatricula: formValue.tipoMatriculaId || '',
      nivelAcademico: formValue.nivelAcademicoQueCursa || '',
      duracionPeriodoAcademico: Number(formValue.duracionPeriodoAcademico) || 0,
      haRepetidoAlMenosUnaMateria: formValue.haRepetidoAlMenosUnaMateria || '',
      paralelo: formValue.paraleloId || '',
      haPerdidoLaGratuidad: formValue.haPerdidoLaGratuidad || '',
      recibePensionDiferenciada: formValue.recibePensionDiferenciada || '',
      
      // Campos económicos - convertir a enum
      estudianteOcupacion: formValue.estudianteocupacionId || '',
      ingresosEstudiante: formValue.ingresosestudianteId || '',
      bonoDesarrollo: formValue.bonodesarrolloId || '',
      
      // Campos de prácticas preprofesionales
      haRealizadoPracticasPreprofesionales: formValue.haRealizadoPracticasPreprofesionales || '',
      nroHorasPracticasPreprofesionalesPorPeriodo: formValue.nroHorasPracticasPreprofesionalesPorPeriodo || 'NA',
      entornoInstitucionalPracticasProfesionales: formValue.entornoInstitucionalPracticasProfesionales || 'NO_APLICA',
      sectorEconomicoPracticaProfesional: formValue.sectorEconomicoPracticaProfesional || 'NO_APLICA',
      
      // Campos de becas - convertir a enum
      tipoBeca: formValue.tipoBecaId || '',
      primeraRazonBeca: formValue.primeraRazonBecaId || '',
      segundaRazonBeca: formValue.segundaRazonBecaId || '',
      terceraRazonBeca: formValue.terceraRazonBecaId || '',
      cuartaRazonBeca: formValue.cuartaRazonBecaId || '',
      quintaRazonBeca: formValue.quintaRazonBecaId || '',
      sextaRazonBeca: formValue.sextaRazonBecaId || '',
      montoBeca: formValue.montoBeca || 'NA',
      porcentajeBecaCoberturaArancel: formValue.porcientoBecaCoberturaArancel || '0',
      porcentajeBecaCoberturaManutencion: formValue.porcientoBecaCoberturaManuntencion || '0',
      
      // Campos de ayuda económica
      montoAyudaEconomica: formValue.montoAyudaEconomica || 'NA',
      montoCreditoEducativo: formValue.montoCreditoEducativo || 'NA',
      
      // Campos de vinculación social
      participaEnProyectoVinculacionSociedad: formValue.participaEnProyectoVinculacionSociedad || '',
      
      // Campos de contacto
      correoElectronico: formValue.correoElectronico || 'NA',
      numeroCelular: formValue.numeroCelular || '0000000000',
      
      // Campos de hogar
      nivelFormacionPadre: formValue.nivelFormacionPadre || '',
      nivelFormacionMadre: formValue.nivelFormacionMadre || '',
      ingresoTotalHogar: formValue.ingresoTotalHogar || 'NA',
      cantidadMiembrosHogar: Number(formValue.cantidadMiembrosHogar) || 0,
      periodoAcademicoId: formValue.periodoAcademicoId ? Number(formValue.periodoAcademicoId) : 1,
    };
    
    // Campos opcionales - solo agregar si tienen valor
    if (formValue.financiamientoBeca) {
      data.financiamientoBeca = formValue.financiamientoBeca;
    }
    if (formValue.tipoAlcanceProyectoVinculacionId) {
      data.tipoAlcanceProyectoVinculacion = formValue.tipoAlcanceProyectoVinculacionId;
    }
    
    // Eliminar provinciaNacimientoId si es undefined para que no se envíe
    if (data.provinciaNacimientoId === undefined) {
      delete data.provinciaNacimientoId;
    }

    // Eliminar campos vacíos que son obligatorios pero no deben enviarse vacíos
    // El backend validará que no estén vacíos
    Object.keys(data).forEach(key => {
      if (data[key] === '' && key !== 'provinciaNacimientoId') {
        // No eliminar campos vacíos, el backend los validará
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
