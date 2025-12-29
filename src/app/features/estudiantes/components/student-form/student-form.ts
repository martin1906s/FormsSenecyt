import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsService, EnumsResponse } from '../../../../services/enums.service';
import { EstudianteService } from '../../../../services/estudiante.service';
import { finalize } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss',
})
export class StudentForm implements OnInit {
  enumsService = inject(EnumsService);
  estudianteService = inject(EstudianteService);
  private cdr = inject(ChangeDetectorRef);
  enums: EnumsResponse | null = null;
  isLoadingEnums = true;
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
  
  // Sistema de navegación por pasos
  currentStep: number = 0;
  totalSteps: number = 11;
  steps: Array<{ id: string; title: string; icon: string; fields: string[] }> = [
    { id: 'identificacion', title: 'Identificación', icon: '📋', fields: ['tipoDocumentoId', 'numeroIdentificacion', 'fechaNacimiento'] },
    { id: 'datosPersonales', title: 'Datos Personales', icon: '👤', fields: ['primerApellido', 'segundoApellido', 'primerNombre', 'segundoNombre', 'sexo', 'genero', 'estadoCivil', 'etnia', 'puebloNacionalidad', 'tipoSangre'] },
    { id: 'discapacidad', title: 'Discapacidad', icon: '♿', fields: ['discapacidad', 'porcentajeDiscapacidad', 'numCarnetConadis', 'tipoDiscapacidad'] },
    { id: 'nacionalidad', title: 'Nacionalidad y Residencia', icon: '🌍', fields: ['paisNacionalidadId', 'provinciaNacimientoId', 'cantonNacimientoId', 'paisResidenciaId', 'provinciaResidenciaId', 'cantonResidenciaId'] },
    { id: 'informacionAcademica', title: 'Información Académica', icon: '🎓', fields: ['tipoColegioId', 'modalidadCarrera', 'jornadaCarrera', 'fechaInicioCarrera', 'fechaMatricula', 'tipoMatriculaId', 'duracionPeriodoAcademico', 'nivelAcademicoQueCursa', 'haRepetidoAlMenosUnaMateria', 'paraleloId', 'haPerdidoLaGratuidad', 'recibePensionDiferenciada'] },
    { id: 'informacionEconomica', title: 'Información Económica', icon: '💰', fields: ['estudianteocupacionId', 'ingresosestudianteId', 'bonoDesarrollo'] },
    { id: 'practicasPreprofesionales', title: 'Prácticas Preprofesionales', icon: '💼', fields: ['haRealizadoPracticasPreprofesionales', 'nroHorasPracticasPreprofesionalesPorPeriodo', 'entornoInstitucionalPracticasProfesionales', 'sectorEconomicoPracticaProfesional'] },
    { id: 'becasAyudas', title: 'Becas y Ayudas', icon: '🎁', fields: ['tipoBecaId', 'primeraRazonBecaId', 'segundaRazonBecaId', 'terceraRazonBecaId', 'cuartaRazonBecaId', 'quintaRazonBecaId', 'sextaRazonBecaId', 'montoBeca', 'porcientoBecaCoberturaArancel', 'porcientoBecaCoberturaManuntencion', 'financiamientoBeca', 'montoAyudaEconomica', 'montoCreditoEducativo'] },
    { id: 'vinculacionSocial', title: 'Vinculación Social', icon: '🤝', fields: ['participaEnProyectoVinculacionSociedad', 'tipoAlcanceProyectoVinculacionId'] },
    { id: 'contacto', title: 'Contacto', icon: '📧', fields: ['correoElectronico', 'numeroCelular'] },
    { id: 'datosHogar', title: 'Datos del Hogar', icon: '🏠', fields: ['nivelFormacionPadre', 'nivelFormacionMadre', 'ingresoTotalHogar', 'cantidadMiembrosHogar'] }
  ];
  
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
  }

  ngOnInit(): void {
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
    this.isLoadingEnums = true;
    // Deshabilitar todos los controles que dependen de enums
    this.disableEnumDependentControls();
    
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
        this.isLoadingEnums = false;
        // Habilitar todos los controles que dependen de enums
        this.enableEnumDependentControls();
        // Verificar estado inicial de tipoAlcanceProyectoVinculacionId
        this.updateTipoAlcanceState();
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (err: any) => {
        console.error('Error fetching enums:', err);
        this.isLoadingEnums = false;
        this.submitError = true;
        this.submitMessage = 'Error al cargar las opciones del formulario. Por favor, recarga la página.';
        this.cdr.detectChanges(); // Forzar detección de cambios
      }
    });
  }

  // Lista de controles que dependen de enums
  private getEnumDependentControls(): string[] {
    return [
      'tipoDocumentoId', 'sexoId', 'generoId', 'estadocivilId', 'etniaId', 'pueblonacionalidadId',
      'tipoSangre', 'discapacidad', 'tipoDiscapacidad', 'paisNacionalidadId', 'provinciaNacimientoId',
      'cantonNacimientoId', 'paisResidenciaId', 'provinciaResidenciaId', 'cantonResidenciaId',
      'tipoColegioId', 'modalidadCarrera', 'jornadaCarrera', 'tipoMatriculaId', 'nivelAcademicoQueCursa',
      'haRepetidoAlMenosUnaMateria', 'paraleloId', 'haPerdidoLaGratuidad', 'recibePensionDiferenciada',
      'estudianteocupacionId', 'ingresosestudianteId', 'bonodesarrolloId', 'haRealizadoPracticasPreprofesionales',
      'entornoInstitucionalPracticasProfesionales', 'sectorEconomicoPracticaProfesional', 'tipoBecaId',
      'primeraRazonBecaId', 'segundaRazonBecaId', 'terceraRazonBecaId', 'cuartaRazonBecaId',
      'quintaRazonBecaId', 'sextaRazonBecaId', 'financiamientoBeca', 'participaEnProyectoVinculacionSociedad',
      // tipoAlcanceProyectoVinculacionId NO se incluye aquí porque tiene su propia lógica condicional
      'nivelFormacionPadre', 'nivelFormacionMadre'
    ];
  }

  private disableEnumDependentControls(): void {
    this.getEnumDependentControls().forEach(controlName => {
      const control = this.studentForm.get(controlName);
      if (control && !control.disabled) {
        control.disable({ emitEvent: false });
      }
    });
  }

  private enableEnumDependentControls(): void {
    this.getEnumDependentControls().forEach(controlName => {
      const control = this.studentForm.get(controlName);
      // Solo habilitar si no está deshabilitado por otra razón (validación condicional)
      // Verificamos si el control tiene una condición específica que lo mantiene deshabilitado
      if (control) {
        // Verificar si el control debe estar deshabilitado por validación condicional
        const shouldBeDisabled = this.shouldControlBeDisabled(controlName);
        if (!shouldBeDisabled && control.disabled) {
          control.enable({ emitEvent: false });
        }
      }
    });
  }

  private shouldControlBeDisabled(controlName: string): boolean {
    // Verificar condiciones específicas que mantienen controles deshabilitados
    const formValue = this.studentForm.value;
    
    // Controles que dependen de discapacidad
    if (controlName === 'tipoDiscapacidad' && formValue.discapacidad !== 'SI') {
      return true;
    }
    
    // Controles que dependen de tipoBecaId
    if (['primeraRazonBecaId', 'segundaRazonBecaId', 'terceraRazonBecaId', 
         'cuartaRazonBecaId', 'quintaRazonBecaId', 'sextaRazonBecaId', 
         'montoBeca', 'porcientoBecaCoberturaArancel', 'porcientoBecaCoberturaManuntencion'].includes(controlName)) {
      return formValue.tipoBecaId === 'NO_APLICA';
    }
    
    // Controles que dependen de haRealizadoPracticasPreprofesionales
    if (['entornoInstitucionalPracticasProfesionales', 'sectorEconomicoPracticaProfesional'].includes(controlName)) {
      return formValue.haRealizadoPracticasPreprofesionales === 'NO';
    }
    
    // Controles que dependen de participaEnProyectoVinculacionSociedad
    if (controlName === 'tipoAlcanceProyectoVinculacionId') {
      return formValue.participaEnProyectoVinculacionSociedad !== 'SI';
    }
    
    // Controles que dependen de provinciaNacimientoId
    if (controlName === 'cantonNacimientoId') {
      return !formValue.provinciaNacimientoId;
    }
    
    // Controles que dependen de provinciaResidenciaId
    if (controlName === 'cantonResidenciaId') {
      return !formValue.provinciaResidenciaId;
    }
    
    // Controles que dependen de pueblonacionalidadId
    if (controlName === 'pueblonacionalidadId') {
      return formValue.etniaId !== 'INDIGENA';
    }
    
    return false;
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

    // Validación condicional para tipoAlcanceProyectoVinculacionId
    // Solo se habilita si participaEnProyectoVinculacionSociedad = "SI"
    this.studentForm.get('participaEnProyectoVinculacionSociedad')?.valueChanges.subscribe((value: any) => {
      this.updateTipoAlcanceState();
    });
  }

  // Método auxiliar para actualizar el estado de tipoAlcanceProyectoVinculacionId
  private updateTipoAlcanceState(): void {
    const participa = this.studentForm.get('participaEnProyectoVinculacionSociedad')?.value;
    const tipoAlcance = this.studentForm.get('tipoAlcanceProyectoVinculacionId');
    
    if (participa === 'SI') {
      // Si participa en proyecto, habilitar el campo
      tipoAlcance?.enable({ emitEvent: false });
    } else {
      // Si no participa, deshabilitar y limpiar valor
      tipoAlcance?.setValue('', { emitEvent: false });
      tipoAlcance?.disable({ emitEvent: false });
    }
    tipoAlcance?.updateValueAndValidity({ emitEvent: false });
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

      // 29.5. duracionPeriodoAcademico (Entero) - obligatorio
      duracionPeriodoAcademico: ['', [
        Validators.required,
        Validators.min(1),
        (control: AbstractControl) => {
          if (!control.value) return null;
          const num = Number(control.value);
          if (isNaN(num) || !Number.isInteger(num) || num < 1) {
            return { numeric: { value: control.value } };
          }
          return null;
        }
      ]],

      // 30. nivelAcademicoQueCursa (Enum) - obligatorio
      nivelAcademicoQueCursa: ['', [Validators.required]],

      // 31. haRepetidoAlMenosUnaMateria (Enum) - obligatorio
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

      // 57. tipoAlcanceProyectoVinculacionId (Enum opcional) - solo se habilita si participaEnProyectoVinculacionSociedad = "SI"
      tipoAlcanceProyectoVinculacionId: [{ value: '', disabled: true }],

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
    // Validar que estamos en el último paso
    if (this.currentStep < this.totalSteps - 1) {
      this.submitError = true;
      this.submitMessage = 'Por favor, completa todos los pasos antes de enviar el formulario.';
      setTimeout(() => {
        this.submitMessage = '';
        this.submitError = false;
      }, 5000);
      return;
    }

    // Validar el último paso antes de enviar
    if (!this.validateCurrentStep()) {
      this.submitError = true;
      this.submitMessage = 'Por favor, completa todos los campos requeridos correctamente antes de enviar.';
      setTimeout(() => {
        this.submitMessage = '';
        this.submitError = false;
      }, 5000);
      return;
    }

    if (this.studentForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitError = false;
      
      const formData = this.getFormDataForBackend();
      console.log('Formulario válido, enviando:', formData);
      console.log('Datos completos del formulario:', JSON.stringify(formData, null, 2));
      
      this.estudianteService.createEstudiante(formData)
        .pipe(
          finalize(() => {
            // Asegurar que isSubmitting se desactive siempre
            console.log('Finalizando petición, desactivando isSubmitting');
            this.isSubmitting = false;
            this.cdr.detectChanges(); // Forzar detección de cambios
          })
        )
        .subscribe({
          next: (response: any) => {
            console.log('Estudiante creado exitosamente:', response);
            this.isSubmitting = false; // Desactivar inmediatamente
            this.submitError = false;
            this.submitMessage = '✓ ¡Estudiante registrado exitosamente!';
            console.log('Mensaje de éxito establecido:', this.submitMessage);
            this.cdr.detectChanges(); // Forzar detección de cambios
            
            // Scroll al mensaje de éxito
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
            
            // Mantener el mensaje visible por 8 segundos
            setTimeout(() => {
              this.submitMessage = '';
              this.cdr.detectChanges();
            }, 8000);
          },
          error: (error: any) => {
            console.error('Error al crear estudiante:', error);
            console.error('Error completo:', JSON.stringify(error, null, 2));
            console.error('Error status:', error.status);
            console.error('Error error:', error.error);
            
            this.isSubmitting = false; // Desactivar inmediatamente
            this.submitError = true;
            
            // Manejar diferentes tipos de errores
            let errorMessage = '⚠️ Error al registrar el estudiante.';
            
            if (error.status === 500) {
              errorMessage = '⚠️ Error interno del servidor (500).\n\nPor favor, verifica que todos los campos estén completos correctamente.\nSi el problema persiste, contacta al administrador.';
              if (error.error?.message) {
                errorMessage += '\n\nDetalle: ' + error.error.message;
              }
            } else if (error.error && Array.isArray(error.error.message)) {
              // Si el error es un array de mensajes de validación
              errorMessage = '⚠️ Error de validación:\n' + error.error.message.join('\n');
            } else if (error.error?.message) {
              errorMessage = '⚠️ ' + error.error.message;
            } else if (error.message) {
              errorMessage = '⚠️ ' + error.message;
            }
            
            this.submitMessage = errorMessage;
            console.log('Mensaje de error establecido:', this.submitMessage);
            this.cdr.detectChanges(); // Forzar detección de cambios
            
            // Scroll al mensaje de error
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
            
            // Mantener el mensaje visible por más tiempo para errores 500
            const timeout = error.status === 500 ? 12000 : 8000;
            setTimeout(() => {
              this.submitMessage = '';
              this.submitError = false;
              this.cdr.detectChanges();
            }, timeout);
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
      duracionPeriodoAcademico: 'Duración Periodo Académico',
      nivelAcademicoQueCursa: 'Nivel Académico que Cursa',
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
      cantidadMiembrosHogar: 'Cantidad Miembros Hogar'
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
      cantonNacimientoId: formValue.cantonNacimientoId || 'NA',
      paisResidenciaId: formValue.paisResidenciaId || '',
      // provinciaResidenciaId es requerido, solo enviar si tiene valor válido
      provinciaResidenciaId: formValue.provinciaResidenciaId || undefined,
      cantonResidenciaId: formValue.cantonResidenciaId || 'NA',
      
      // Campos académicos - convertir a enum si es necesario
      tipoColegioId: formValue.tipoColegioId || '',
      modalidadCarrera: formValue.modalidadCarrera || '',
      jornadaCarrera: formValue.jornadaCarrera || '',
      fechaInicioCarrera: formValue.fechaInicioCarrera || '',
      fechaMatricula: formValue.fechaMatricula || '',
      tipoMatricula: formValue.tipoMatriculaId || '',
      duracionPeriodoAcademico: Number(formValue.duracionPeriodoAcademico) || 0,
      nivelAcademico: formValue.nivelAcademicoQueCursa || '',
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
    };
    
    // Campos opcionales - solo agregar si tienen valor
    if (formValue.financiamientoBeca) {
      data.financiamientoBeca = formValue.financiamientoBeca;
    }
    if (formValue.tipoAlcanceProyectoVinculacionId) {
      data.tipoAlcanceProyectoVinculacion = formValue.tipoAlcanceProyectoVinculacionId;
    }
    
    // Eliminar provinciaNacimientoId si es undefined para que no se envíe (es opcional)
    if (data.provinciaNacimientoId === undefined || data.provinciaNacimientoId === '') {
      delete data.provinciaNacimientoId;
    }

    // provinciaResidenciaId es requerido según el DTO
    // Si está undefined, null o vacío, no enviarlo (el backend validará)
    if (data.provinciaResidenciaId === undefined || data.provinciaResidenciaId === null || data.provinciaResidenciaId === '') {
      delete data.provinciaResidenciaId;
    }

    // Validar que los campos requeridos tengan valores válidos
    const requiredFields = [
      'tipoDocumento', 'numeroIdentificacion', 'primerApellido', 'segundoApellido',
      'primerNombre', 'segundoNombre', 'sexo', 'genero', 'estadoCivil', 'etnia',
      'puebloNacionalidad', 'tipoSangre', 'discapacidad', 'fechaNacimiento',
      'paisNacionalidadId', 'cantonNacimientoId', 'paisResidenciaId', 'cantonResidenciaId',
      'tipoColegioId', 'modalidadCarrera', 'jornadaCarrera', 'fechaInicioCarrera',
      'fechaMatricula', 'tipoMatricula', 'nivelAcademico', 'haRepetidoAlMenosUnaMateria',
      'paralelo', 'haPerdidoLaGratuidad', 'recibePensionDiferenciada',
      'estudianteOcupacion', 'ingresosEstudiante', 'bonoDesarrollo',
      'haRealizadoPracticasPreprofesionales', 'nroHorasPracticasPreprofesionalesPorPeriodo',
      'entornoInstitucionalPracticasProfesionales', 'sectorEconomicoPracticaProfesional',
      'tipoBeca', 'primeraRazonBeca', 'segundaRazonBeca', 'terceraRazonBeca',
      'cuartaRazonBeca', 'quintaRazonBeca', 'sextaRazonBeca', 'montoBeca',
      'porcentajeBecaCoberturaArancel', 'porcentajeBecaCoberturaManutencion',
      'montoAyudaEconomica', 'montoCreditoEducativo',
      'participaEnProyectoVinculacionSociedad', 'correoElectronico', 'numeroCelular',
      'nivelFormacionPadre', 'nivelFormacionMadre', 'ingresoTotalHogar', 'cantidadMiembrosHogar'
    ];

    // Verificar campos requeridos que están vacíos
    const emptyRequiredFields = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (emptyRequiredFields.length > 0) {
      console.warn('Campos requeridos vacíos:', emptyRequiredFields);
    }

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

  // Métodos de navegación por pasos
  getProgress(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }

  isStepValid(stepIndex: number): boolean {
    const step = this.steps[stepIndex];
    if (!step) return false;
    
    let isValid = true;
    step.fields.forEach(fieldName => {
      const control = this.studentForm.get(fieldName);
      if (control && control.invalid) {
        isValid = false;
      }
    });
    return isValid;
  }

  validateCurrentStep(): boolean {
    const step = this.steps[this.currentStep];
    if (!step) return false;

    // Marcar todos los campos del paso como touched y dirty
    step.fields.forEach(fieldName => {
      const control = this.studentForm.get(fieldName);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });

    // Verificar si todos los campos requeridos son válidos
    const isValid = this.isStepValid(this.currentStep);
    
    if (!isValid) {
      // Obtener campos con errores para mostrar mensaje específico
      const camposConErrores = this.getCamposConErroresForStep(this.currentStep);
      if (camposConErrores.length > 0) {
        this.submitMessage = `Por favor, completa correctamente los siguientes campos antes de continuar:\n\n${camposConErrores.join('\n')}`;
      } else {
        this.submitMessage = 'Por favor, completa todos los campos requeridos correctamente antes de continuar.';
      }
      this.submitError = true;
    }
    
    return isValid;
  }

  getCamposConErroresForStep(stepIndex: number): string[] {
    const step = this.steps[stepIndex];
    if (!step) return [];
    
    const camposConErrores: string[] = [];
    const nombresCampos: { [key: string]: string } = {
      tipoDocumentoId: 'Tipo de Documento',
      numeroIdentificacion: 'Número de Identificación',
      fechaNacimiento: 'Fecha de Nacimiento',
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
      duracionPeriodoAcademico: 'Duración Periodo Académico',
      nivelAcademicoQueCursa: 'Nivel Académico que Cursa',
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
      cantidadMiembrosHogar: 'Cantidad Miembros Hogar'
    };

    step.fields.forEach(fieldName => {
      const control = this.studentForm.get(fieldName);
      if (control && control.invalid) {
        const nombreCampo = nombresCampos[fieldName] || fieldName;
        const error = this.getErrorMessageForField(fieldName);
        if (error) {
          camposConErrores.push(`• ${nombreCampo}: ${error}`);
        } else {
          camposConErrores.push(`• ${nombreCampo}: Este campo es obligatorio`);
        }
      }
    });

    return camposConErrores;
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this.submitError = false;
        this.submitMessage = '';
        // Scroll al inicio del formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // El mensaje ya se estableció en validateCurrentStep()
      // Scroll al primer campo con error
      this.scrollToFirstError();
    }
  }

  scrollToFirstError(): void {
    const step = this.steps[this.currentStep];
    if (!step) return;

    for (const fieldName of step.fields) {
      const control = this.studentForm.get(fieldName);
      if (control && control.invalid) {
        const element = document.querySelector(`[formControlName="${fieldName}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
          break;
        }
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.totalSteps) {
      // Validar todos los pasos anteriores antes de permitir saltar
      let canGoToStep = true;
      for (let i = 0; i < stepIndex; i++) {
        if (!this.isStepValid(i)) {
          canGoToStep = false;
          break;
        }
      }
      
      if (canGoToStep || stepIndex <= this.currentStep) {
        this.currentStep = stepIndex;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.submitError = true;
        this.submitMessage = 'Debes completar los pasos anteriores antes de avanzar.';
        setTimeout(() => {
          this.submitMessage = '';
          this.submitError = false;
        }, 3000);
      }
    }
  }

  getCurrentStepFields(): string[] {
    return this.steps[this.currentStep]?.fields || [];
  }

  getStepCompletionStatus(stepIndex: number): 'complete' | 'current' | 'pending' {
    if (stepIndex < this.currentStep) {
      return this.isStepValid(stepIndex) ? 'complete' : 'pending';
    } else if (stepIndex === this.currentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  }

  // Método para llenar todos los campos con datos de prueba
  fillTestData(): void {
    if (!this.enums) {
      alert('Por favor, espera a que se carguen las opciones del formulario.');
      return;
    }

    // Obtener primeros valores válidos de los enums
    const tipoDocumento = this.enums.TipoDocumento?.[0] || 'CEDULA';
    const sexo = this.enums.Sexo?.[0] || 'HOMBRE';
    const genero = this.enums.Genero?.[0] || 'MASCULINO';
    const estadoCivil = this.enums.EstadoCivil?.[0] || 'SOLTERO';
    const etnia = this.enums.Etnia?.[0] || 'MESTIZO';
    const puebloNacionalidad = this.enums.PuebloNacionalidad?.[0] || 'NO_APLICA';
    const tipoSangre = this.enums.TipoSangre?.[0] || 'O_POSITIVO';
    const discapacidad = this.enums.Discapacidad?.[0] || 'NO';
    const tipoDiscapacidad = this.enums.TipoDiscapacidad?.[0] || 'NO_APLICA';
    const pais = this.enums.Pais?.find(p => p === 'ECUADOR') || this.enums.Pais?.[0] || 'ECUADOR';
    const provincia = this.enums.Provincia?.[0] || 'AZUAY';
    const canton = this.enums.Canton?.[0] || 'CUENCA';
    const tipoColegio = this.enums.TipoColegio?.[0] || 'FISCAL';
    const modalidadCarrera = this.enums.ModalidadCarrera?.[0] || 'PRESENCIAL';
    const jornadaCarrera = this.enums.JornadaCarrera?.[0] || 'MATUTINA';
    const tipoMatricula = this.enums.TipoMatricula?.[0] || 'ORDINARIA';
    const nivelAcademico = this.enums.NivelAcademico?.[0] || 'PRIMERO';
    const haRepetido = this.enums.HaRepetidoAlMenosUnaMateria?.[0] || 'NO';
    const paralelo = this.enums.Paralelo?.[0] || 'A';
    const haPerdidoGratuidad = this.enums.HaPerdidoLaGratuidad?.[0] || 'NO';
    const recibePension = this.enums.RecibePensionDiferenciada?.[0] || 'NO';
    const estudianteOcupacion = this.enums.EstudianteOcupacion?.[0] || 'SOLO_ESTUDIA';
    const ingresosEstudiante = this.enums.IngresosEstudiante?.[0] || 'FINANCIAR_ESTUDIOS';
    const bonoDesarrollo = this.enums.BonoDesarrollo?.[0] || 'NO';
    const haRealizadoPracticas = this.enums.HaRealizadoPracticasPreprofesionales?.[0] || 'SI';
    const entornoPracticas = this.enums.EntornoInstitucionalPracticasProfesionales?.[0] || 'PUBLICA';
    const sectorPracticas = this.enums.SectorEconomicoPracticaProfesional?.[0] || 'SALUD';
    const tipoBeca = this.enums.TipoBeca?.[0] || 'PARCIAL';
    const primeraRazonBeca = this.enums.PrimeraRazonBeca?.[0] || 'NO_APLICA';
    const segundaRazonBeca = this.enums.SegundaRazonBeca?.[0] || 'NO_APLICA';
    const terceraRazonBeca = this.enums.TerceraRazonBeca?.[0] || 'NO_APLICA';
    const cuartaRazonBeca = this.enums.CuartaRazonBeca?.[0] || 'NO_APLICA';
    const quintaRazonBeca = this.enums.QuintaRazonBeca?.[0] || 'NO_APLICA';
    const sextaRazonBeca = this.enums.SextaRazonBeca?.[0] || 'NO_APLICA';
    const financiamientoBeca = this.enums.FinanciamientoBeca?.[0] || 'FONDOS_PROPIOS';
    const participaVinculacion = this.enums.ParticipaEnProyectoVinculacionSociedad?.[0] || 'SI';
    const tipoAlcance = this.enums.TipoAlcanceProyectoVinculacion?.[0] || 'PROVINCIAL';
    const nivelFormacionPadre = this.enums.NivelFormacionPadre?.[0] || 'SUPERIOR_UNIVERSITARIA';
    const nivelFormacionMadre = this.enums.NivelFormacionMadre?.[0] || 'SUPERIOR_UNIVERSITARIA';

    // Llenar todos los campos del formulario
    this.studentForm.patchValue({
      // Identificación
      tipoDocumentoId: tipoDocumento,
      numeroIdentificacion: '1723456789',
      
      // Datos personales
      primerApellido: 'GARCIA',
      segundoApellido: 'PEREZ',
      primerNombre: 'JUAN',
      segundoNombre: 'CARLOS',
      sexoId: sexo,
      generoId: genero,
      estadocivilId: estadoCivil,
      etniaId: etnia,
      pueblonacionalidadId: puebloNacionalidad,
      tipoSangre: tipoSangre,
      
      // Discapacidad
      discapacidad: discapacidad,
      porcentajeDiscapacidad: 'NA',
      numCarnetConadis: 'NA',
      tipoDiscapacidad: tipoDiscapacidad,
      
      // Fechas y ubicación
      fechaNacimiento: '2000-05-15',
      paisNacionalidadId: pais,
      provinciaNacimientoId: provincia,
      cantonNacimientoId: canton,
      paisResidenciaId: pais,
      provinciaResidenciaId: provincia,
      cantonResidenciaId: canton,
      
      // Información académica
      tipoColegioId: tipoColegio,
      modalidadCarrera: modalidadCarrera,
      jornadaCarrera: jornadaCarrera,
      fechaInicioCarrera: '2020-09-01',
      fechaMatricula: '2024-09-01',
      tipoMatriculaId: tipoMatricula,
      duracionPeriodoAcademico: 22,
      nivelAcademicoQueCursa: nivelAcademico,
      haRepetidoAlMenosUnaMateria: haRepetido,
      paraleloId: paralelo,
      haPerdidoLaGratuidad: haPerdidoGratuidad,
      recibePensionDiferenciada: recibePension,
      
      // Información económica
      estudianteocupacionId: estudianteOcupacion,
      ingresosestudianteId: ingresosEstudiante,
      bonodesarrolloId: bonoDesarrollo,
      
      // Prácticas preprofesionales
      haRealizadoPracticasPreprofesionales: haRealizadoPracticas,
      nroHorasPracticasPreprofesionalesPorPeriodo: '240',
      entornoInstitucionalPracticasProfesionales: entornoPracticas,
      sectorEconomicoPracticaProfesional: sectorPracticas,
      
      // Becas
      tipoBecaId: tipoBeca,
      primeraRazonBecaId: primeraRazonBeca,
      segundaRazonBecaId: segundaRazonBeca,
      terceraRazonBecaId: terceraRazonBeca,
      cuartaRazonBecaId: cuartaRazonBeca,
      quintaRazonBecaId: quintaRazonBeca,
      sextaRazonBecaId: sextaRazonBeca,
      montoBeca: '500',
      porcientoBecaCoberturaArancel: '50',
      porcientoBecaCoberturaManuntencion: '30',
      financiamientoBeca: financiamientoBeca,
      
      // Ayuda económica
      montoAyudaEconomica: 'NA',
      montoCreditoEducativo: 'NA',
      
      // Vinculación social
      participaEnProyectoVinculacionSociedad: participaVinculacion,
      tipoAlcanceProyectoVinculacionId: tipoAlcance,
      
      // Contacto
      correoElectronico: 'juan.garcia@example.com',
      numeroCelular: '0987654321',
      
      // Hogar
      nivelFormacionPadre: nivelFormacionPadre,
      nivelFormacionMadre: nivelFormacionMadre,
      ingresoTotalHogar: '1200',
      cantidadMiembrosHogar: 4
    });

    // Habilitar campos condicionales si es necesario
    if (discapacidad === 'SI') {
      this.studentForm.get('porcentajeDiscapacidad')?.enable();
      this.studentForm.get('numCarnetConadis')?.enable();
      this.studentForm.get('tipoDiscapacidad')?.enable();
      this.studentForm.patchValue({
        porcentajeDiscapacidad: '50',
        numCarnetConadis: '1234567',
        tipoDiscapacidad: this.enums.TipoDiscapacidad?.[1] || 'FISICA'
      });
    }

    // Habilitar campos de provincia y cantón si el país es Ecuador
    if (pais === 'ECUADOR') {
      this.studentForm.get('provinciaNacimientoId')?.enable();
      this.studentForm.get('cantonNacimientoId')?.enable();
      this.studentForm.get('provinciaResidenciaId')?.enable();
      this.studentForm.get('cantonResidenciaId')?.enable();
    }

    // Actualizar búsquedas de provincias y cantones
    this.provinciaNacimientoSearch = this.getEnumLabel(provincia);
    this.cantonNacimientoSearch = this.getEnumLabel(canton);
    this.provinciaResidenciaSearch = this.getEnumLabel(provincia);
    this.cantonResidenciaSearch = this.getEnumLabel(canton);

    // Marcar todos los campos como touched para mostrar validaciones
    this.markFormGroupTouched(this.studentForm);

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Mostrar mensaje de éxito
    this.submitError = false;
    this.submitMessage = '✓ Datos de prueba cargados correctamente';
    setTimeout(() => {
      this.submitMessage = '';
    }, 3000);
  }

  // Funciones de mapeo para convertir valores enum a códigos numéricos
  private mapTipoDocumento(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'CEDULA': 1,
      'PASAPORTE': 2
    };
    return map[value] || null;
  }

  private mapSexo(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'HOMBRE': 1,
      'MUJER': 2
    };
    return map[value] || null;
  }

  private mapGenero(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'MASCULINO': 1,
      'FEMENINO': 2
    };
    return map[value] || null;
  }

  private mapEstadoCivil(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SOLTERO': 1,
      'CASADO': 2,
      'DIVORCIADO': 3,
      'UNION_LIBRE': 4,
      'VIUDO': 5
    };
    return map[value] || null;
  }

  private mapEtnia(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'INDIGENA': 1,
      'AFROECUATORIANO': 2,
      'NEGRO': 3,
      'MULATO': 4,
      'MONTUVIO': 5,
      'MESTIZO': 6,
      'BLANCO': 7,
      'OTRO': 8,
      'NO_REGISTRA': 9
    };
    return map[value] || null;
  }

  private mapTipoSangre(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'A_POSITIVO': 1,
      'A_NEGATIVO': 2,
      'B_POSITIVO': 3,
      'B_NEGATIVO': 4,
      'AB_POSITIVO': 5,
      'AB_NEGATIVO': 6,
      'O_POSITIVO': 7,
      'O_NEGATIVO': 8
    };
    return map[value] || null;
  }

  private mapDiscapacidad(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SI': 1,
      'NO': 2
    };
    return map[value] || null;
  }

  private mapTipoDiscapacidad(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'INTELECTUAL': 1,
      'FISICA': 2,
      'VISUAL': 3,
      'AUDITIVA': 4,
      'PSICOSOCIAL': 5, // Mental
      'OTRA': 6,
      'NO_APLICA': 7
    };
    return map[value] || null;
  }

  private mapTipoColegio(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'FISCAL': 1,
      'FISCOMISIONAL': 2,
      'PARTICULAR': 3,
      'MUNICIPAL': 4,
      'EXTRANJERO': 5,
      'NO_REGISTRA': 6
    };
    return map[value] || null;
  }

  private mapModalidadCarrera(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'PRESENCIAL': 1,
      'SEMIPRESENCIAL': 2,
      'DISTANCIA': 3,
      'DUAL': 4,
      'LINEA': 5,
      'HIBRIDA': 6
    };
    return map[value] || null;
  }

  private mapJornadaCarrera(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'MATUTINA': 1,
      'VESPERTINA': 2,
      'NOCTURNA': 3,
      'INTENSIVA': 4
    };
    return map[value] || null;
  }

  private mapTipoMatricula(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'ORDINARIA': 1,
      'EXTRAORDINARIA': 2,
      'ESPECIAL': 3
    };
    return map[value] || null;
  }

  private mapNivelAcademico(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'PRIMERO': 1,
      'SEGUNDO': 2,
      'TERCERO': 3,
      'CUARTO': 4,
      'QUINTO': 5,
      'SEXTO': 6
    };
    return map[value] || null;
  }

  private mapHaRepetido(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SI': 1,
      'NO': 2
    };
    return map[value] || null;
  }

  private mapParalelo(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
      'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15,
      'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20
    };
    return map[value] || null;
  }

  private mapHaPerdidoGratuidad(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SI': 1,
      'NO': 2,
      'NO_APLICA': 3
    };
    return map[value] || null;
  }

  private mapRecibePensionDiferenciada(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SI': 1,
      'NO': 2,
      'NO_APLICA': 3
    };
    return map[value] || null;
  }

  private mapEstudianteOcupacion(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SOLO_ESTUDIA': 1,
      'TRABAJA_Y_ESTUDIA': 2
    };
    return map[value] || null;
  }

  private mapIngresosEstudiante(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'FINANCIAR_ESTUDIOS': 1,
      'PARA_MANTENER_HOGAR': 2,
      'GASTOS_PERSONALES': 3,
      'NO_APLICA': 4
    };
    return map[value] || null;
  }

  private mapBonoDesarrollo(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SI': 1,
      'NO': 2
    };
    return map[value] || null;
  }

  private mapHaRealizadoPracticas(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SI': 1,
      'NO': 2
    };
    return map[value] || null;
  }

  private mapEntornoInstitucional(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'PUBLICA': 1,
      'PRIVADA': 2,
      'ONG': 3,
      'OTRO': 4,
      'NO_APLICA': 5
    };
    return map[value] || null;
  }

  private mapSectorEconomico(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'AGRICULTURA_GANADERIA_SILVICULTURA_Y_PESCA': 1,
      'EXPLOTACION_DE_MINAS_Y_CANTERAS': 2,
      'INDUSTRIAS_MANUFACTURERAS': 3,
      'SUMINISTRO_ELECTRICIDAD_GAS_VAPOR_AIRE_ACONDICIONADO': 4,
      'DISTRIBUCION_AGUA_ALCANTARILLADO_GESTION_DESECHOS_SANEAMIENTO': 5,
      'CONSTRUCCION': 6,
      'COMERCIO_MAYOR_MENOR_REPARACION_VEHICULOS_AUTOMOTORES': 7,
      'TRANSPORTE_Y_ALMACENAMIENTO': 9,
      'ALOJAMIENTO_Y_SERVICIO_DE_COMIDAS': 10,
      'INFORMACION_Y_COMUNICACION': 11,
      'ACTIVIDADES_FINANCIERAS_Y_DE_SEGUROS': 12,
      'ACTIVIDADES_INMOBILIARIAS': 13,
      'ACTIVIDADES_PROFESIONALES_CIENTIFICAS_Y_TECNICAS': 14,
      'SERVICIOS_ADMINISTRATIVOS_Y_DE_APOYO': 15,
      'ADMINISTRACION_PUBLICA_Y_DEFENSA': 16,
      'ENSEÑANZA': 17,
      'ATENCION_SALUD_HUMANA_Y_ASISTENCIA_SOCIAL': 18,
      'ARTES_ENTRETENIMIENTO_Y_RECREACION': 19,
      'OTRAS_ACTIVIDADES_DE_SERVICIOS': 20,
      'HOGARES_PRODUCTORES_BIENES_SERVICIOS_USO_PROPIO': 21,
      'NO_APLICA': 22
    };
    return map[value] || null;
  }

  private mapTipoBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'TOTAL': 1,
      'PARCIAL': 2,
      'NO_APLICA': 3
    };
    return map[value] || null;
  }

  private mapPrimeraRazonBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SOCIOECONOMICA': 1,
      'NO_APLICA': 2
    };
    return map[value] || null;
  }

  private mapSegundaRazonBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'EXCELENCIA_ACADEMICA': 1,
      'NO_APLICA': 2
    };
    return map[value] || null;
  }

  private mapTerceraRazonBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'DEPORTISTA': 1,
      'NO_APLICA': 2
    };
    return map[value] || null;
  }

  private mapCuartaRazonBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'PUEBLOS_Y_NACIONALIDADES': 1,
      'NO_APLICA': 2
    };
    return map[value] || null;
  }

  private mapQuintaRazonBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'DISCAPACIDAD': 1,
      'NO_APLICA': 2
    };
    return map[value] || null;
  }

  private mapSextaRazonBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'OTRA': 1,
      'NO_APLICA': 2
    };
    return map[value] || null;
  }

  private mapFinanciamientoBeca(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'FONDOS_PROPIOS': 1,
      'TRANSFERENCIA_DEL_ESTADO': 2,
      'DONACIONES': 3,
      'NO_APLICA': 4
    };
    return map[value] || null;
  }

  private mapParticipaVinculacion(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'SI': 1,
      'NO': 2,
      'NO_APLICA': 3
    };
    return map[value] || null;
  }

  private mapTipoAlcanceVinculacion(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'NACIONAL': 1,
      'PROVINCIAL': 2,
      'CANTONAL': 3,
      'PARROQUIAL': 4,
      'NO_APLICA': 5
    };
    return map[value] || null;
  }

  private mapNivelFormacion(value: string): number | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'CENTRO_ALFABETIZACION': 1,
      'JARDIN_DE_INFANTES': 2,
      'PRIMARIA': 3,
      'EDUCACION_BASICA': 4,
      'SECUNDARIA': 5,
      'EDUCACION_MEDIA': 6,
      'SUPERIOR_NO_UNIVERSITARIA': 7,
      'SUPERIOR_UNIVERSITARIA': 8,
      'POSGRADO': 9,
      'NO_APLICA': 10
    };
    return map[value] || null;
  }

  // Mapeo de PuebloNacionalidad a códigos 1-34
  private mapPuebloNacionalidad(value: string): number | null {
    if (!value || value === 'NO_APLICA') return 34;
    const map: { [key: string]: number } = {
      'KICHWA': 1,
      'AWA': 2,
      'CHACHI': 3,
      'EPERA': 4,
      'TSACHILA': 5,
      'ACHUAR': 6,
      'COFAN': 7,
      'SECOYA': 8,
      'SHIWIAR': 9,
      'SHUAR': 10,
      'WAORANI': 11,
      'SAPARA': 12,
      'ANDOA': 13,
      'SIONA': 14,
      'HUANCAVILCA': 15,
      'MANTA': 16,
      'PALTA': 17,
      'CHIBULEO': 18,
      'KANARI': 19,
      'KARANKI': 20,
      'KAYAMPI': 21,
      'KISAPINCHA': 22,
      'KITU_KARA': 23,
      'NATABUELA': 24,
      'OTAVALO': 25,
      'PANZALEO': 26,
      'PURUHA': 27,
      'SALASACA': 28,
      'SARAGURO': 29,
      'TOMABELA': 30,
      'WARANKA': 31,
      'QUIJOS': 32,
      'PASTO': 33,
      'NO_APLICA': 34
    };
    return map[value] || null;
  }

  // Mapeo de Provincia a códigos 01-90 (como strings con cero inicial)
  private mapProvincia(value: string): string | null {
    if (!value) return null;
    const map: { [key: string]: number } = {
      'AZUAY': 1,
      'BOLIVAR': 2,
      'CANAR': 3,
      'CARCHI': 4,
      'COTOPAXI': 5,
      'CHIMBORAZO': 6,
      'EL_ORO': 7,
      'ESMERALDAS': 8,
      'GUAYAS': 9,
      'IMBABURA': 10,
      'LOJA': 11,
      'LOS_RIOS': 12,
      'MANABI': 13,
      'MORONA_SANTIAGO': 14,
      'NAPO': 15,
      'PASTAZA': 16,
      'PICHINCHA': 17,
      'TUNGURAHUA': 18,
      'ZAMORA_CHINCHIPE': 19,
      'GALAPAGOS': 20,
      'SUCUMBIOS': 21,
      'ORELLANA': 22,
      'SANTO_DOMINGO_DE_LOS_TSACHILAS': 23,
      'SANTA_ELENA': 24
    };
    const code = map[value];
    return code ? code.toString().padStart(2, '0') : null;
  }

  // Mapeo de Canton a códigos numéricos con cero inicial (ej: "0110", "0108", etc.)
  private mapCanton(value: string): string | null {
    if (!value) return null;
    // Mapeo completo de cantones según los códigos proporcionados
    const map: { [key: string]: number } = {
      'OÑA': 110,
      'SANTA_ISABEL': 108,
      'NABON': 104,
      'GIRON': 102,
      'SAN_FERNANDO': 107,
      'PUCARA': 106,
      'SIGSIG': 109,
      'CAMILO_PONCE_ENRIQUEZ': 115,
      'CHORDELEG': 111,
      'GUALACEO': 103,
      'CUENCA': 101,
      'SEVILLA_DE_ORO': 113,
      'EL_PAN': 112,
      'GUACHAPALA': 114,
      'PAUTE': 105,
      'CHILLANES': 202,
      'SAN_MIGUEL': 205,
      'CHIMBO': 203,
      'CALUMA': 206,
      'GUARANDA': 201,
      'ECHEANDIA': 204,
      'LAS_NAVES': 207,
      'DELEG': 306,
      'AZOGUES': 301,
      'BIBLIAN': 302,
      'CANAR': 303,
      'EL_TAMBO': 305,
      'SUSCAL': 307,
      'LA_TRONCAL': 304,
      'BOLIVAR': 402,
      'MIRA': 404,
      'MONTUFAR': 405,
      'SAN_PEDRO_DE_HUACA': 406,
      'ESPEJO': 403,
      'TULCAN': 401,
      'PANGUA': 503,
      'SALCEDO': 505,
      'PUJILI': 504,
      'LATACUNGA': 501,
      'SAQUISILI': 506,
      'LA_MANA': 502,
      'SIGCHOS': 507,
      'CHUNCHI': 605,
      'CUMANDA': 610,
      'ALAUSI': 602,
      'PALLATANGA': 608,
      'GUAMOTE': 606,
      'CHAMBO': 604,
      'COLTA': 603,
      'RIOBAMBA': 601,
      'GUANO': 607,
      'PENIPE': 609,
      'MARCABELI': 708,
      'BALSAS': 704,
      'LAS_LAJAS': 714,
      'PORTOVELO': 711,
      'ZARUMA': 713,
      'PIÑAS': 710,
      'ATAHUALPA': 703,
      'HUAQUILLAS': 707,
      'ARENILLAS': 702,
      'SANTA_ROSA': 712,
      'CHILLA': 705,
      'PASAJE': 709,
      'MACHALA': 701,
      'EL_GUABO': 706,
      'QUININDE': 804,
      'MUISNE': 803,
      'ATACAMES': 806,
      'ESMERALDAS': 801,
      'RIOVERDE': 807,
      'ELOY_ALFARO': 802,
      'SAN_LORENZO': 805,
      'GUAYAQUIL': 901,
      'ALFREDO_BAQUERIZO_MORENO_JUJAN': 902,
      'BALAO': 903,
      'BALZAR': 904,
      'COLIMES': 905,
      'DAULE': 906,
      'DURAN': 907,
      'EL_EMPALME': 908,
      'EL_TRIUNFO': 909,
      'MILAGRO': 910,
      'NARANJAL': 911,
      'NARANJITO': 912,
      'PALESTINA': 913,
      'PEDRO_CARBO': 914,
      'SAMBORONDON': 916,
      'SANTA_LUCIA': 918,
      'URBINA_JADO': 919,
      'YAGUACHI': 920,
      'PLAYAS': 921,
      'SIMON_BOLIVAR': 922,
      'CORONEL_MARCELINO_MARIDUEÑA': 923,
      'LOMAS_DE_SARGENTILLO': 924,
      'NOBOL': 925,
      'GENERAL_ANTONIO_ELIZALDE': 927,
      'ISIDRO_AYORA': 928,
      'OTAVALO': 1004,
      'COTACACHI': 1003,
      'ANTONIO_ANTE': 1002,
      'PIMAMPIRO': 1005,
      'SAN_MIGUEL_DE_URCUQUI': 1006,
      'IBARRA': 1001,
      'ESPINDOLA': 1106,
      'QUILANGA': 1115,
      'ZAPOTILLO': 1113,
      'MACARA': 1108,
      'GONZANAMA': 1107,
      'CALVAS': 1102,
      'SOZORANGA': 1112,
      'PINDAL': 1114,
      'CELICA': 1104,
      'PALTAS': 1109,
      'OLMEDO': 1116,
      'CATAMAYO': 1103,
      'PUYANGO': 1110,
      'LOJA': 1101,
      'CHAGUARPAMBA': 1105,
      'SARAGURO': 1111,
      'BABAHOYO': 1201,
      'BABA': 1202,
      'MONTALVO': 1203,
      'PUEBLOVIEJO': 1204,
      'QUEVEDO': 1205,
      'URDANETA': 1206,
      'VENTANAS': 1207,
      'VINCES': 1208,
      'PALENQUE': 1209,
      'BUENA_FE': 1210,
      'VALENCIA': 1211,
      'MOCACHE': 1212,
      'QUINSALOMA': 1213,
      'PUERTO_LOPEZ': 1319,
      'PAJAN': 1310,
      'CANTÓN_24_DE_MAYO': 1316,
      'JIPIJAPA': 1306,
      'SANTA_ANA': 1313,
      'MONTECRISTI': 1309,
      'MANTA': 1308,
      'JARAMIJO': 1321,
      'PORTOVIEJO': 1301,
      'JUNIN': 1307,
      'ROCAFUERTE': 1312,
      'C_BOLIVAR': 1302,
      'PICHINCHA': 1311,
      'TOSAGUA': 1315,
      'SUCRE': 1314,
      'CHONE': 1303,
      'SAN_VICENTE': 1322,
      'EL_CARMEN': 1304,
      'FLAVIO_ALFARO': 1305,
      'JAMA': 1320,
      'PEDERNALES': 1317,
      'GUALAQUIZA': 1402,
      'SAN_JUAN_BOSCO': 1408,
      'LIMON_INDANZA': 1403,
      'TIWINTZA': 1412,
      'LOGROÑO': 1410,
      'SANTIAGO': 1405,
      'SUCUA': 1406,
      'MORONA': 1401,
      'TAISHA': 1409,
      'HUAMBOYA': 1407,
      'PALORA': 1404,
      'PABLO_SEXTO': 1411,
      'CARLOS_JULIO_AROSEMENA_TOLA': 1509,
      'TENA': 1501,
      'ARCHIDONA': 1503,
      'QUIJOS': 1507,
      'EL_CHACO': 1504,
      'PASTAZA': 1601,
      'MERA': 1602,
      'SANTA_CLARA': 1603,
      'ARAJUNO': 1604,
      'MEJIA': 1703,
      'DISTRITO_METROPOLITANO_DE_QUITO': 1701,
      'CAYAMBE': 1702,
      'SAN_MIGUEL_DE_LOS_BANCOS': 1707,
      'PEDRO_MONCAYO': 1704,
      'PEDRO_VICENTE_MALDONADO': 1708,
      'PUERTO_QUITO': 1709,
      'MOCHA': 1804,
      'QUERO': 1806,
      'CEVALLOS': 1803,
      'TISALEO': 1809,
      'PATATE': 1805,
      'PELILEO': 1807,
      'AMBATO': 1801,
      'PILLARO': 1808,
      'CHINCHIPE': 1902,
      'PALANDA': 1908,
      'ZAMORA': 1901,
      'NANGARITZA': 1903,
      'PAQUISHA': 1909,
      'CENTINELA_DEL_CONDOR': 1907,
      'YANTZAZA': 1905,
      'EL_PANGUI': 1906,
      'YACUAMBI': 1904,
      'SAN_CRISTOBAL': 2001,
      'SANTA_CRUZ': 2003,
      'ISABELA': 2002,
      'CUYABENO': 2107,
      'SHUSHUFINDI': 2104,
      'GONZALO_PIZARRO': 2102,
      'LAGO_AGRIO': 2101,
      'PUTUMAYO': 2103,
      'CASCALES': 2106,
      'SUCUMBIOS': 2105,
      'AGUARICO': 2202,
      'LORETO': 2204,
      'ORELLANA': 2201,
      'LA_JOYA_DE_LOS_SACHAS': 2203,
      'SANTO_DOMINGO': 2301,
      'LA_CONCORDIA': 2302,
      'LA_LIBERTAD': 2402,
      'SALINAS': 2403,
      'SANTA_ELENA': 2401,
      'ABDON_CALDERON': 9007,
      'EL_PIEDRERO': 9004,
      'JUVAL': 9006,
      'SANTA_ROSA_DE_AGUA_CLARA': 9005,
      'MATILDE_ESTHER': 9008,
      'LAS_GOLONDRINAS': 9001
    };
    const code = map[value];
    // Formatear con 4 dígitos con cero inicial (ej: "0110", "0108")
    return code ? code.toString().padStart(4, '0') : null;
  }

  // Mapeo de Pais a códigos 1-999
  private mapPais(value: string): number | null {
    if (!value) return null;
    // Mapeo de países más comunes, agregar más según necesidad
    const map: { [key: string]: number } = {
      'AFGANISTAN': 1,
      'ALBANIA': 2,
      'ALEMANIA': 3,
      'ANDORRA': 4,
      'ANGOLA': 5,
      'ANGUILA': 6,
      'ANTIGUA_Y_BARBUDA': 7,
      'ARABIA_SAUDITA': 8,
      'ARGELIA': 9,
      'ARGENTINA': 10,
      'ARMENIA': 11,
      'ARUBA': 12,
      'AUSTRALIA': 13,
      'AUSTRIA': 14,
      'AZERBAIYAN': 15,
      'BAHAMAS': 16,
      'BAHREIN': 17,
      'BANGLADESH': 18,
      'BARBADOS': 19,
      'BELGICA': 20,
      'BELICE': 21,
      'BENIN': 22,
      'BERMUDAS': 23,
      'BIELORRUSIA': 24,
      'BOLIVIA': 25,
      'BONAIRE_SAN_EUSTAQUIO_Y_SABA': 26,
      'BOSNIA_Y_HERZEGOVINA': 27,
      'BOTSWANA': 28,
      'BRASIL': 29,
      'BRUNEI_DARUSSALAM': 30,
      'BULGARIA': 31,
      'BURKINA_FASO': 32,
      'BURUNDI': 33,
      'BUTAN': 34,
      'CABO_VERDE': 35,
      'CAMBOYA': 36,
      'CAMERUN': 37,
      'CANADA': 38,
      'CHAD': 39,
      'CHILE': 40,
      'CHINA': 41,
      'CHIPRE': 42,
      'COLOMBIA': 43,
      'COMORAS': 44,
      'CONGO': 45,
      'COREA_DEL_NORTE': 46,
      'COREA_DEL_SUR': 47,
      'COSTA_DE_MARFIL': 48,
      'COSTA_RICA': 49,
      'CROACIA': 50,
      'CUBA': 51,
      'CURACAO': 52,
      'DINAMARCA': 53,
      'DJIBOUTI': 54,
      'DOMINICA': 55,
      'ECUADOR': 56,
      'EGIPTO': 57,
      'EL_SALVADOR': 58,
      'EL_VATICANO': 59,
      'EMIRATOS_ARABES_UNIDOS': 60,
      'ERITREA': 61,
      'ESLOVAQUIA': 62,
      'ESLOVENIA': 63,
      'ESPANA': 64,
      'ESTADO_DE_PALESTINA': 65,
      'ESTADOS_UNIDOS_DE_AMERICA': 66,
      'ESTONIA': 67,
      'ETIOPIA': 68,
      'FIYI': 69,
      'FILIPINAS': 70,
      'FINLANDIA': 71,
      'FRANCIA': 72,
      'GABON': 73,
      'GAMBIA': 74,
      'GEORGIA': 75,
      'GHANA': 76,
      'GIBRALTAR': 77,
      'GRANADA': 78,
      'GRECIA': 79,
      'GROENLANDIA': 80,
      'GUADALUPE': 81,
      'GUAM': 82,
      'GUATEMALA': 83,
      'GUAYANA_FRANCESA': 84,
      'GUERNSEY': 85,
      'GUINEA': 86,
      'GUINEA_ECUATORIAL': 87,
      'GUINEA_BISSAU': 88,
      'GUYANA': 89,
      'HAITI': 90,
      'HONDURAS': 91,
      'HONG_KONG': 92,
      'HUNGRIA': 93,
      'INDIA': 94,
      'INDONESIA': 95,
      'IRAK': 96,
      'IRAN': 97,
      'IRLANDA': 98,
      'ISLA_DE_MAN': 99,
      'ISLA_NORFOLK': 100,
      'ISLANDIA': 101,
      'ISLAS_ALAND': 102,
      'ISLAS_CAIMAN': 103,
      'ISLAS_COOK': 104,
      'ISLAS_FEROE': 106,
      'ISLAS_MALVINAS_FALKLAND': 107,
      'ISLAS_MARIANAS_DEL_NORTE': 108,
      'ISLAS_MARSHALL': 109,
      'ISLAS_SALOMON': 110,
      'ISLAS_TURCAS_Y_CAICOS': 111,
      'ISLAS_VIRGENES_AMERICANAS': 112,
      'ISLAS_VIRGENES_BRITANICAS': 113,
      'ISLAS_WALLIS_Y_FUTUNA': 114,
      'ISRAEL': 115,
      'ITALIA': 116,
      'JAMAICA': 117,
      'JAPON': 118,
      'JERSEY': 119,
      'JORDANIA': 120,
      'KAZAJSTAN': 121,
      'KENYA': 122,
      'KIRGUISTAN': 123,
      'KIRIBATI': 124,
      'KUWAIT': 125,
      'LA_EX_REPUBLICA_YUGOSLAVA_DE_MACEDONIA': 126,
      'LESOTO': 127,
      'LETONIA': 128,
      'LIBANO': 129,
      'LIBERIA': 130,
      'LIBIA': 131,
      'LIECHTENSTEIN': 132,
      'LITUANIA': 133,
      'LUXEMBURGO': 134,
      'MACAO': 135,
      'MADAGASCAR': 136,
      'MALASIA': 137,
      'MALAUI': 138,
      'MALDIVAS': 139,
      'MALI': 140,
      'MALTA': 141,
      'MARRUECOS': 142,
      'MARTINICA': 143,
      'MAURICIO': 144,
      'MAURITANIA': 145,
      'MAYOTTE': 146,
      'MEXICO': 147,
      'MICRONESIA': 148,
      'MONACO': 149,
      'MONGOLIA': 150,
      'MONTENEGRO': 151,
      'MONTSERRAT': 152,
      'MOZAMBIQUE': 153,
      'MYANMAR': 154,
      'NAMIBIA': 155,
      'NAURU': 156,
      'NEPAL': 157,
      'NICARAGUA': 158,
      'NIGER': 159,
      'NIGERIA': 160,
      'NIUE': 161,
      'NORUEGA': 162,
      'NUEVA_CALEDONIA': 163,
      'NUEVA_ZELANDA': 164,
      'OMAN': 165,
      'PAISES_BAJOS': 166,
      'PAKISTAN': 167,
      'PALAU': 168,
      'PANAMA': 169,
      'PAPUA_NUEVA_GUINEA': 170,
      'PARAGUAY': 171,
      'PERU': 172,
      'PITCAIRN': 173,
      'POLINESIA_FRANCES': 174,
      'POLONIA': 175,
      'PORTUGAL': 176,
      'PUERTO_RICO': 177,
      'QATAR': 178,
      'REINO_UNIDO_DE_GRAN_BRETANA_E_IRLANDA_DEL_NORTE': 179,
      'REPUBLICA_ARABE_SIRIA': 180,
      'REPUBLICA_CENTROAFRICANA': 181,
      'REPUBLICA_CHECA': 182,
      'REPUBLICA_DE_MOLDAVIA': 183,
      'REPUBLICA_DEMOCRATICA_DEL_CONGO': 184,
      'REPUBLICA_DEMOCRATICA_POPULAR_LAO': 185,
      'REPUBLICA_DOMINICANA': 186,
      'REPUBLICA_UNIDA_DE_TANZANIA': 187,
      'REUNION': 188,
      'RUMANIA': 189,
      'RUSIA': 190,
      'RWANDA': 191,
      'SAHARA_OCCIDENTAL': 192,
      'SAINT_BARTHELEMY': 193,
      'SAINT_MARTIN': 194,
      'SAMOA': 195,
      'SAMOA_AMERICANA': 196,
      'SAN_CRISTOBAL_Y_NIEVES': 197,
      'SAN_MARINO': 198,
      'SAN_PEDRO_Y_MIQUELON': 199,
      'SAN_VICENTE_Y_LAS_GRANADINAS': 200,
      'SANTA_ELENA': 201,
      'SANTA_LUCIA': 202,
      'SANTO_TOME_Y_PRINCIPE': 203,
      'SENEGAL': 205,
      'SERBIA': 206,
      'SEYCHELLES': 207,
      'SIERRA_LEONA': 208,
      'SINGAPUR': 209,
      'SINT_MAARTEN': 210,
      'SOMALIA': 211,
      'SRI_LANKA': 212,
      'SUDAFRICA': 213,
      'SUDAN': 214,
      'SUDAN_DEL_SUR': 215,
      'SUECIA': 216,
      'SUIZA': 217,
      'SURINAME': 218,
      'SVALBARD_Y_JAN_MAYEN': 219,
      'SWAZILANDIA': 220,
      'TAILANDIA': 221,
      'TAYIKISTAN': 222,
      'TIMOR_LESTE': 223,
      'TOGO': 224,
      'TOKELAU': 225,
      'TONGA': 226,
      'TRINIDAD_Y_TOBAGO': 227,
      'TUNEZ': 228,
      'TURKMENISTAN': 229,
      'TURQUIA': 230,
      'TUVALU': 231,
      'UCRANIA': 232,
      'UGANDA': 233,
      'URUGUAY': 234,
      'UZBEKISTAN': 235,
      'VANUATU': 236,
      'VENEZUELA': 237,
      'VIET_NAM': 238,
      'YEMEN': 239,
      'ZAMBIA': 240,
      'ZIMBABWE': 241,
      'ANTARTIDA': 242,
      'ISLA_BOUVET': 243,
      'TERRITORIO_BRITANICO_DE_LA_OCEANO_INDICO': 244,
      'TAIWAN': 245,
      'ISLA_DE_NAVIDAD': 246,
      'ISLAS_COCOS': 247,
      'GEORGIA_DEL_SUR_Y_LAS_ISLAS_SANDWICH_DEL_SUR': 248,
      'TERRITORIOS_AUSTRALES_FRANCESES': 249,
      'NO_REGISTRA': 999
    };
    return map[value] || null;
  }

  // Método para exportar todos los estudiantes a Excel
  exportToExcel(): void {
    this.isSubmitting = true;
    this.submitMessage = 'Descargando datos...';
    this.submitError = false;
    this.cdr.detectChanges();

    this.estudianteService.getEstudiantes().subscribe({
      next: (estudiantes: any[]) => {
        try {
          // Mapear los datos del backend a los nombres de columnas solicitados con códigos numéricos
          const excelData = estudiantes.map(estudiante => ({
            tipoDocumentoId: this.mapTipoDocumento(estudiante.tipoDocumento) ?? '',
            numeroIdentificacion: estudiante.numeroIdentificacion || '',
            primerApellido: estudiante.primerApellido || '',
            segundoApellido: estudiante.segundoApellido || '',
            primerNombre: estudiante.primerNombre || '',
            segundoNombre: estudiante.segundoNombre || '',
            sexoId: this.mapSexo(estudiante.sexo) ?? '',
            generoId: this.mapGenero(estudiante.genero) ?? '',
            estadocivilId: this.mapEstadoCivil(estudiante.estadoCivil) ?? '',
            etniaId: this.mapEtnia(estudiante.etnia) ?? '',
            pueblonacionalidadId: this.mapPuebloNacionalidad(estudiante.puebloNacionalidad) ?? '',
            tipoSangre: this.mapTipoSangre(estudiante.tipoSangre) ?? '',
            discapacidad: this.mapDiscapacidad(estudiante.discapacidad) ?? '',
            porcentajeDiscapacidad: estudiante.porcentajeDiscapacidad || '',
            numCarnetConadis: estudiante.numCarnetConadis || '',
            tipoDiscapacidad: this.mapTipoDiscapacidad(estudiante.tipoDiscapacidad) ?? '',
            fechaNacimiento: estudiante.fechaNacimiento || '',
            paisNacionalidadId: this.mapPais(estudiante.paisNacionalidadId) ?? '',
            provinciaNacimientoId: this.mapProvincia(estudiante.provinciaNacimientoId) ?? '',
            cantonNacimientoId: this.mapCanton(estudiante.cantonNacimientoId) ?? '',
            paisResidenciaId: this.mapPais(estudiante.paisResidenciaId) ?? '',
            provinciaResidenciaId: this.mapProvincia(estudiante.provinciaResidenciaId) ?? '',
            cantonResidenciaId: this.mapCanton(estudiante.cantonResidenciaId) ?? '',
            tipoColegioId: this.mapTipoColegio(estudiante.tipoColegioId) ?? '',
            modalidadCarrera: this.mapModalidadCarrera(estudiante.modalidadCarrera) ?? '',
            jornadaCarrera: this.mapJornadaCarrera(estudiante.jornadaCarrera) ?? '',
            fechaInicioCarrera: estudiante.fechaInicioCarrera || '',
            fechaMatricula: estudiante.fechaMatricula || '',
            tipoMatriculaId: this.mapTipoMatricula(estudiante.tipoMatricula) ?? '',
            nivelAcademicoQueCursa: this.mapNivelAcademico(estudiante.nivelAcademico) ?? '',
            duracionPeriodoAcademico: estudiante.duracionPeriodoAcademico || 0,
            haRepetidoAlMenosUnaMateria: this.mapHaRepetido(estudiante.haRepetidoAlMenosUnaMateria) ?? '',
            paraleloId: this.mapParalelo(estudiante.paralelo) ?? '',
            haPerdidoLaGratuidad: this.mapHaPerdidoGratuidad(estudiante.haPerdidoLaGratuidad) ?? '',
            recibePensionDiferenciada: this.mapRecibePensionDiferenciada(estudiante.recibePensionDiferenciada) ?? '',
            estudianteocupacionId: this.mapEstudianteOcupacion(estudiante.estudianteOcupacion) ?? '',
            ingresosestudianteId: this.mapIngresosEstudiante(estudiante.ingresosEstudiante) ?? '',
            bonodesarrolloId: this.mapBonoDesarrollo(estudiante.bonoDesarrollo) ?? '',
            haRealizadoPracticasPreprofesionales: this.mapHaRealizadoPracticas(estudiante.haRealizadoPracticasPreprofesionales) ?? '',
            nroHorasPracticasPreprofesionalesPorPeriodo: estudiante.nroHorasPracticasPreprofesionalesPorPeriodo || '',
            entornoInstitucionalPracticasProfesionales: this.mapEntornoInstitucional(estudiante.entornoInstitucionalPracticasProfesionales) ?? '',
            sectorEconomicoPracticaProfesional: this.mapSectorEconomico(estudiante.sectorEconomicoPracticaProfesional) ?? '',
            tipoBecaId: this.mapTipoBeca(estudiante.tipoBeca) ?? '',
            primeraRazonBecaId: this.mapPrimeraRazonBeca(estudiante.primeraRazonBeca) ?? '',
            segundaRazonBecaId: this.mapSegundaRazonBeca(estudiante.segundaRazonBeca) ?? '',
            terceraRazonBecaId: this.mapTerceraRazonBeca(estudiante.terceraRazonBeca) ?? '',
            cuartaRazonBecaId: this.mapCuartaRazonBeca(estudiante.cuartaRazonBeca) ?? '',
            quintaRazonBecaId: this.mapQuintaRazonBeca(estudiante.quintaRazonBeca) ?? '',
            sextaRazonBecaId: this.mapSextaRazonBeca(estudiante.sextaRazonBeca) ?? '',
            montoBeca: estudiante.montoBeca || '',
            porcientoBecaCoberturaArancel: estudiante.porcentajeBecaCoberturaArancel || '',
            porcientoBecaCoberturaManuntencion: estudiante.porcentajeBecaCoberturaManutencion || '',
            financiamientoBeca: this.mapFinanciamientoBeca(estudiante.financiamientoBeca) ?? '',
            montoAyudaEconomica: estudiante.montoAyudaEconomica || '',
            montoCreditoEducativo: estudiante.montoCreditoEducativo || '',
            participaEnProyectoVinculacionSociedad: this.mapParticipaVinculacion(estudiante.participaEnProyectoVinculacionSociedad) ?? '',
            tipoAlcanceProyectoVinculacionId: this.mapTipoAlcanceVinculacion(estudiante.tipoAlcanceProyectoVinculacion) ?? '',
            correoElectronico: estudiante.correoElectronico || '',
            numeroCelular: estudiante.numeroCelular || '',
            nivelFormacionPadre: this.mapNivelFormacion(estudiante.nivelFormacionPadre) ?? '',
            nivelFormacionMadre: this.mapNivelFormacion(estudiante.nivelFormacionMadre) ?? '',
            ingresoTotalHogar: estudiante.ingresoTotalHogar || '',
            cantidadMiembrosHogar: estudiante.cantidadMiembrosHogar || 0
          }));

          // Crear el libro de trabajo de Excel
          const worksheet = XLSX.utils.json_to_sheet(excelData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');

          // Generar el nombre del archivo con la fecha actual
          const fecha = new Date().toISOString().split('T')[0];
          const fileName = `estudiantes_senecyt_${fecha}.xlsx`;

          // Descargar el archivo
          XLSX.writeFile(workbook, fileName);

          this.isSubmitting = false;
          this.submitError = false;
          this.submitMessage = `✓ Excel exportado exitosamente: ${fileName}`;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.submitMessage = '';
            this.cdr.detectChanges();
          }, 5000);
        } catch (error) {
          console.error('Error al generar Excel:', error);
          this.isSubmitting = false;
          this.submitError = true;
          this.submitMessage = '⚠️ Error al generar el archivo Excel. Por favor, intenta nuevamente.';
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error al obtener estudiantes:', error);
        this.isSubmitting = false;
        this.submitError = true;
        this.submitMessage = '⚠️ Error al obtener los datos. Por favor, intenta nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }
}
