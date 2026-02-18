import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EnumsService, EnumsResponse } from '../../../../services/enums.service';
import { EstudianteService } from '../../../../services/estudiante.service';
import { finalize } from 'rxjs';

/** Opciones de carrera (mismas que movilis-landing: SectionCarreras / RegistrationModal / Registro) */
export const CARRERAS_OPCIONES_LANDING: string[] = [
  'Desarrollo de Software',
  'Estética',
  'Transporte'
];

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  enums: EnumsResponse | null = null;

  /** Opciones de carrera (mismas que en el landing Movilis) */
  carrerasOpciones = CARRERAS_OPCIONES_LANDING;

  /** Opciones para estructura de la vivienda */
  estructuraViviendaOpciones: { value: string; label: string }[] = [
    { value: 'HORMIGON', label: 'Hormigón' },
    { value: 'LADRILLO', label: 'Ladrillo' },
    { value: 'BLOQUE', label: 'Bloque' },
    { value: 'ADOBE', label: 'Adobe' },
    { value: 'MADERA', label: 'Madera' },
    { value: 'CANA', label: 'Caña' },
    { value: 'OTRO', label: 'Otro' },
    { value: 'NA', label: 'N/A' },
  ];

  /** Opciones para tipo de vivienda */
  tipoViviendaOpciones: { value: string; label: string }[] = [
    { value: 'SUITE_LUJO', label: 'Suite de lujo' },
    { value: 'CASA', label: 'Casa' },
    { value: 'DEPARTAMENTO', label: 'Departamento' },
    { value: 'HABITACION', label: 'Habitación' },
    { value: 'MEDIA_AGUA', label: 'Media agua' },
    { value: 'RANCHO', label: 'Rancho' },
    { value: 'NA', label: 'N/A' },
  ];

  /** Opciones para servicios disponibles (selección múltiple) */
  serviciosDisponiblesOpciones: { value: string; label: string }[] = [
    { value: 'ENERGIA_ELECTRICA', label: 'Energía eléctrica' },
    { value: 'AGUA_POTABLE', label: 'Agua potable' },
    { value: 'ALCANTARILLADO', label: 'Alcantarillado' },
    { value: 'TELEFONO_FIJO', label: 'Teléfono fijo' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'TV_CABLE', label: 'TV cable' },
    { value: 'PLAN_DATOS', label: 'Plan de datos' },
  ];

  /** Opciones de parentesco para composición familiar e ingresos */
  parentescoOpciones: { value: string; label: string }[] = [
    { value: 'MADRE', label: 'Madre' },
    { value: 'PADRE', label: 'Padre' },
    { value: 'HERMANO', label: 'Hermano' },
    { value: 'HERMANA', label: 'Hermana' },
    { value: 'HIJO', label: 'Hijo' },
    { value: 'HIJA', label: 'Hija' },
    { value: 'ABUELO', label: 'Abuelo' },
    { value: 'ABUELA', label: 'Abuela' },
    { value: 'TIO', label: 'Tío' },
    { value: 'TIA', label: 'Tía' },
    { value: 'PRIMO', label: 'Primo' },
    { value: 'PRIMA', label: 'Prima' },
    { value: 'CONYUGE', label: 'Cónyuge' },
    { value: 'PAREJA', label: 'Pareja' },
    { value: 'OTRO', label: 'Otro' },
    { value: 'NA', label: 'N/A' },
  ];

  /** Opciones para tipo de violencia (solo visibles si violencia familiar = Sí) */
  tipoViolenciaOpciones: { value: string; label: string }[] = [
    { value: 'FISICA', label: 'Física' },
    { value: 'PSICOLOGICA', label: 'Psicológica' },
    { value: 'SEXUAL', label: 'Sexual' },
    { value: 'SIMBOLICA', label: 'Simbólica' },
    { value: 'PATRIMONIAL_ECONOMICA', label: 'Patrimonial o económica' },
  ];

  isLoadingEnums = true;
  isSubmitting = false;
  submitMessage = '';
  submitError = false;

  /** Búsqueda por cédula en primer paso */
  isSearchingByCedula = false;
  cedulaSearchMessage = '';

  /** Subida de foto título de bachiller */
  tituloBachillerUploading = false;
  tituloBachillerError = '';

  /** Subida de croquis vivienda (bucket maps) */
  croquisUploading = false;
  croquisError = '';

  // Propiedades para autocompletado de países, provincias y cantones
  filteredPaisesNacionalidad: string[] = [];
  filteredPaisesResidencia: string[] = [];
  filteredProvinciasNacimiento: string[] = [];
  filteredCantonesNacimiento: string[] = [];
  filteredProvinciasResidencia: string[] = []; 
  filteredCantonesResidencia: string[] = [];
  
  // Propiedades para controlar la visibilidad de los dropdowns
  showPaisesNacionalidad: boolean = false;
  showPaisesResidencia: boolean = false;
  showProvinciasNacimiento: boolean = false;
  showCantonesNacimiento: boolean = false;
  showProvinciasResidencia: boolean = false;
  showCantonesResidencia: boolean = false;
  
  // Propiedades para almacenar el texto de búsqueda temporal
  paisNacionalidadSearch: string = '';
  paisResidenciaSearch: string = '';
  provinciaNacimientoSearch: string = '';
  cantonNacimientoSearch: string = '';
  provinciaResidenciaSearch: string = '';
  cantonResidenciaSearch: string = '';

  studentForm: FormGroup;
  
  // Sistema de navegación por pasos
  currentStep: number = 0;
  totalSteps: number = 11;
  steps: Array<{ id: string; title: string; icon: string; fields: string[] }> = [
      { id: 'identificacion', title: 'Identificación', icon: 'clipboard', fields: ['tipoDocumentoId', 'numeroIdentificacion', 'fechaNacimiento'] },
    { id: 'datosPersonales', title: 'Datos Personales', icon: 'user', fields: ['primerApellido', 'segundoApellido', 'primerNombre', 'segundoNombre', 'sexo', 'genero', 'estadoCivil', 'etnia', 'puebloNacionalidad', 'tipoSangre'] },
    { id: 'discapacidad', title: 'Discapacidad', icon: 'accessibility', fields: ['discapacidad', 'porcentajeDiscapacidad', 'numCarnetConadis', 'tipoDiscapacidad', 'alergias', 'medicamentos', 'referenciaPersonalNombre', 'referenciaPersonalParentesco', 'referenciaPersonalTelefono', 'enfermedadCatastrofica'] },
    { id: 'nacionalidad', title: 'Nacionalidad y Residencia', icon: 'globe', fields: ['paisNacionalidadId', 'provinciaNacimientoId', 'cantonNacimientoId', 'paisResidenciaId', 'provinciaResidenciaId', 'cantonResidenciaId'] },
    { id: 'informacionAcademica', title: 'Información Académica', icon: 'graduation', fields: ['tipoColegioId', 'modalidadCarrera', 'jornadaCarrera', 'fechaInicioCarrera', 'fechaMatricula', 'tipoMatriculaId', 'duracionPeriodoAcademico', 'nivelAcademicoQueCursa', 'haRepetidoAlMenosUnaMateria', 'paraleloId', 'haPerdidoLaGratuidad', 'recibePensionDiferenciada', 'carrera', 'disenoCurricular', 'periodoAcademico'] },
    { id: 'informacionEconomica', title: 'Información Económica', icon: 'dollar', fields: ['estudianteocupacionId', 'ingresosestudianteId', 'bonoDesarrollo'] },
    { id: 'practicasPreprofesionales', title: 'Prácticas Preprofesionales', icon: 'briefcase', fields: ['haRealizadoPracticasPreprofesionales', 'nroHorasPracticasPreprofesionalesPorPeriodo', 'entornoInstitucionalPracticasProfesionales', 'sectorEconomicoPracticaProfesional'] },
    { id: 'becasAyudas', title: 'Becas y Ayudas', icon: 'gift', fields: ['tipoBecaId', 'primeraRazonBecaId', 'segundaRazonBecaId', 'terceraRazonBecaId', 'cuartaRazonBecaId', 'quintaRazonBecaId', 'sextaRazonBecaId', 'montoBeca', 'porcientoBecaCoberturaArancel', 'porcientoBecaCoberturaManuntencion', 'financiamientoBeca', 'montoAyudaEconomica', 'montoCreditoEducativo'] },
    { id: 'vinculacionSocial', title: 'Vinculación Social', icon: 'handshake', fields: ['participaEnProyectoVinculacionSociedad', 'tipoAlcanceProyectoVinculacionId'] },
    { id: 'contacto', title: 'Contacto', icon: 'mail', fields: ['correoElectronico', 'numeroCelular', 'direccionDomicilio', 'correoInstitucional', 'lugarResidencia'] },
    { id: 'datosHogar', title: 'Datos del Hogar', icon: 'home', fields: ['nivelFormacionPadre', 'nivelFormacionMadre', 'ingresoTotalHogar', 'cantidadMiembrosHogar'] }
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

  // Clave para localStorage
  private readonly STORAGE_KEY = 'student_form_data';
  private readonly STORAGE_STEP_KEY = 'student_form_current_step';

  constructor(private fb: FormBuilder) {
    this.studentForm = this.createForm();
    this.setupConditionalValidators();
    this.setupAutoUppercase();
    this.setupNormalizeNA();
    this.setupAutoSave();
  }

  ngOnInit(): void {
    this.loadSavedData();
    this.applyCarreraFromLanding();
    this.loadEnums();
    this.setupTotalEgresos();
  }

  private static parseEgresoVal(v: unknown): number {
    if (v == null || v === '') return 0;
    const s = String(v).trim().toUpperCase();
    if (s === 'NA') return 0;
    const n = parseFloat(String(v).trim().replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  private updateTotalEgresos(): void {
    const names = ['egresoVivienda', 'egresoAlimentacion', 'egresoEducacion', 'egresoIndumentaria', 'egresoTransporte', 'egresoSalud', 'egresoServiciosBasicos', 'egresoOtros'];
    let sum = 0;
    for (const name of names) {
      sum += StudentForm.parseEgresoVal(this.studentForm.get(name)?.value);
    }
    this.studentForm.get('totalEgresos')?.setValue(sum === 0 ? '' : sum, { emitEvent: false });
  }

  private setupTotalEgresos(): void {
    const names = ['egresoVivienda', 'egresoAlimentacion', 'egresoEducacion', 'egresoIndumentaria', 'egresoTransporte', 'egresoSalud', 'egresoServiciosBasicos', 'egresoOtros'];
    names.forEach(name => this.studentForm.get(name)?.valueChanges.subscribe(() => this.updateTotalEgresos()));
    this.updateTotalEgresos();
  }

  /** Lee valor del objeto API (soporta camelCase por si el JSON viene con otro formato). */
  private static getApiVal(obj: any, ...keys: string[]): string | number | null | undefined {
    if (obj == null) return undefined;
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return undefined;
  }

  /** Convierte respuesta del API (estudiante) al formato del formulario para patchValue. */
  private apiEstudianteToFormValue(e: any): Record<string, unknown> {
    const v = (key: string, fallback: string | number = '') => StudentForm.getApiVal(e, key) ?? fallback;
    const estructura = e?.estructuraVivienda && String(e.estructuraVivienda).startsWith('OTRO:')
      ? { estructuraVivienda: 'OTRO', estructuraViviendaEspecifique: String(e.estructuraVivienda).replace(/^OTRO:\s*/i, '').trim() }
      : { estructuraVivienda: v('estructuraVivienda', '') };
    return {
      tipoDocumentoId: v('tipoDocumento'),
      numeroIdentificacion: v('numeroIdentificacion'),
      primerApellido: v('primerApellido'),
      segundoApellido: v('segundoApellido'),
      primerNombre: v('primerNombre'),
      segundoNombre: v('segundoNombre'),
      sexoId: v('sexo'),
      generoId: v('genero'),
      estadocivilId: v('estadoCivil'),
      etniaId: v('etnia'),
      pueblonacionalidadId: v('puebloNacionalidad'),
      tipoSangre: v('tipoSangre'),
      discapacidad: v('discapacidad'),
      porcentajeDiscapacidad: e.porcentajeDiscapacidad ?? '',
      numCarnetConadis: e.numCarnetConadis ?? '',
      tipoDiscapacidad: e.tipoDiscapacidad ?? '',
      fechaNacimiento: e.fechaNacimiento ?? '',
      paisNacionalidadId: e.paisNacionalidadId ?? '',
      provinciaNacimientoId: e.provinciaNacimientoId ?? '',
      cantonNacimientoId: e.cantonNacimientoId ?? '',
      paisResidenciaId: e.paisResidenciaId ?? '',
      provinciaResidenciaId: e.provinciaResidenciaId ?? '',
      cantonResidenciaId: e.cantonResidenciaId ?? '',
      tipoColegioId: e.tipoColegioId ?? '',
      modalidadCarrera: e.modalidadCarrera ?? '',
      jornadaCarrera: e.jornadaCarrera ?? '',
      fechaInicioCarrera: e.fechaInicioCarrera ?? '',
      fechaMatricula: e.fechaMatricula ?? '',
      tipoMatriculaId: e.tipoMatricula ?? '',
      duracionPeriodoAcademico: e.duracionPeriodoAcademico ?? 1,
      nivelAcademicoQueCursa: e.nivelAcademico ?? '',
      haRepetidoAlMenosUnaMateria: e.haRepetidoAlMenosUnaMateria ?? '',
      paraleloId: e.paralelo ?? '',
      haPerdidoLaGratuidad: e.haPerdidoLaGratuidad ?? '',
      recibePensionDiferenciada: e.recibePensionDiferenciada ?? '',
      estudianteocupacionId: e.estudianteOcupacion ?? '',
      ingresosestudianteId: e.ingresosEstudiante ?? '',
      bonodesarrolloId: e.bonoDesarrollo ?? '',
      haRealizadoPracticasPreprofesionales: e.haRealizadoPracticasPreprofesionales ?? '',
      nroHorasPracticasPreprofesionalesPorPeriodo: e.nroHorasPracticasPreprofesionalesPorPeriodo ?? '',
      entornoInstitucionalPracticasProfesionales: e.entornoInstitucionalPracticasProfesionales ?? '',
      sectorEconomicoPracticaProfesional: e.sectorEconomicoPracticaProfesional ?? '',
      tipoBecaId: e.tipoBeca ?? '',
      primeraRazonBecaId: e.primeraRazonBeca ?? '',
      segundaRazonBecaId: e.segundaRazonBeca ?? '',
      terceraRazonBecaId: e.terceraRazonBeca ?? '',
      cuartaRazonBecaId: e.cuartaRazonBeca ?? '',
      quintaRazonBecaId: e.quintaRazonBeca ?? '',
      sextaRazonBecaId: e.sextaRazonBeca ?? '',
      montoBeca: e.montoBeca ?? '',
      porcientoBecaCoberturaArancel: e.porcentajeBecaCoberturaArancel ?? '',
      porcientoBecaCoberturaManuntencion: e.porcentajeBecaCoberturaManutencion ?? '',
      financiamientoBeca: e.financiamientoBeca ?? '',
      montoAyudaEconomica: e.montoAyudaEconomica ?? '',
      montoCreditoEducativo: e.montoCreditoEducativo ?? '',
      participaEnProyectoVinculacionSociedad: e.participaEnProyectoVinculacionSociedad ?? '',
      tipoAlcanceProyectoVinculacionId: e.tipoAlcanceProyectoVinculacion ?? '',
      correoElectronico: e.correoElectronico ?? '',
      numeroCelular: e.numeroCelular ?? '',
      direccionDomicilio: e.direccionDomicilio ?? '',
      correoInstitucional: e.correoInstitucional ?? '',
      lugarResidencia: e.lugarResidencia ?? '',
      carrera: e.carrera ?? '',
      disenoCurricular: e.disenoCurricular ?? '',
      periodoAcademico: e.periodoAcademico ?? '',
      alergias: e.alergias ?? '',
      medicamentos: e.medicamentos ?? '',
      referenciaPersonalNombre: e.referenciaPersonalNombre ?? '',
      referenciaPersonalParentesco: e.referenciaPersonalParentesco ?? '',
      referenciaPersonalTelefono: e.referenciaPersonalTelefono ?? '',
      enfermedadCatastrofica: e.enfermedadCatastrofica ?? '',
      nivelFormacionPadre: e.nivelFormacionPadre ?? '',
      nivelFormacionMadre: e.nivelFormacionMadre ?? '',
      ingresoTotalHogar: e.ingresoTotalHogar ?? '',
      cantidadMiembrosHogar: e.cantidadMiembrosHogar ?? 1,
      numeroConvencional: e.numeroConvencional ?? '',
      presentaCarnetDiscapacidad: e.presentaCarnetDiscapacidad ?? '',
      presentaAlergiaImportante: e.presentaAlergiaImportante ?? '',
      nombreColegioProcedencia: e.nombreColegioProcedencia ?? '',
      tituloBachiller: e.tituloBachiller ?? '',
      anioGraduacion: e.anioGraduacion ?? '',
      financiamientoQuienes: e.financiamientoQuienes ?? '',
      referenciaDomiciliaria: e.referenciaDomiciliaria ?? '',
      parroquiaResidencia: e.parroquiaResidencia ?? '',
      barrioSector: e.barrioSector ?? '',
      zonaVivienda: e.zonaVivienda ?? '',
      coordenadasVivienda: e.coordenadasVivienda ?? '',
      croquisViviendaUrl: e.croquisViviendaUrl ?? '',
      tipoPropiedadVivienda: e.tipoPropiedadVivienda ?? '',
      ...estructura,
      tipoVivienda: e.tipoVivienda ?? '',
      serviciosDisponibles: e.serviciosDisponibles ?? '',
      cantidadBanos: e.cantidadBanos ?? '',
      cantidadHabitaciones: e.cantidadHabitaciones ?? '',
      comparteHabitacion: e.comparteHabitacion ?? '',
      conQuienVive: e.conQuienVive ?? '',
      tamanoViviendaSuficiente: e.tamanoViviendaSuficiente ?? '',
      dinamicaFamiliar: e.dinamicaFamiliar ?? '',
      violenciaFamiliar: e.violenciaFamiliar ?? '',
      tipoViolenciaFamiliar: e.tipoViolenciaFamiliar ?? '',
      estudianteCabezaFamiliar: e.estudianteCabezaFamiliar ?? '',
      familiaDiscapacidadEnfermedadCatastrofica: e.familiaDiscapacidadEnfermedadCatastrofica ?? '',
      familiaProblemaSalud: e.familiaProblemaSalud ?? '',
      familiaParentesco: e.familiaParentesco ?? '',
      familiaServiciosMedicos: e.familiaServiciosMedicos ?? '',
      familiaServiciosMedicosDetalle: e.familiaServiciosMedicosDetalle ?? '',
      egresoVivienda: e.egresoVivienda ?? '',
      egresoAlimentacion: e.egresoAlimentacion ?? '',
      egresoEducacion: e.egresoEducacion ?? '',
      egresoIndumentaria: e.egresoIndumentaria ?? '',
      egresoTransporte: e.egresoTransporte ?? '',
      egresoSalud: e.egresoSalud ?? '',
      egresoServiciosBasicos: e.egresoServiciosBasicos ?? '',
      egresoOtros: e.egresoOtros ?? '',
      totalEgresos: e.totalEgresos ?? '',
    };
  }

  /** Busca estudiante por tipo de documento y número de identificación; si existe, carga los datos en el formulario. */
  buscarPorCedula(): void {
    const tipoDoc = this.studentForm.get('tipoDocumentoId')?.value;
    const numero = this.studentForm.get('numeroIdentificacion')?.value;
    const tipo = typeof tipoDoc === 'string' ? tipoDoc.trim() : '';
    const num = typeof numero === 'string' ? numero.trim() : String(numero ?? '').trim();
    if (!tipo || !num) {
      this.cedulaSearchMessage = '';
      return;
    }
    this.isSearchingByCedula = true;
    this.cedulaSearchMessage = 'Buscando...';
    this.cdr.detectChanges();
    this.estudianteService.getEstudianteByCedula(tipo, num).subscribe({
      next: (estudiante: any) => {
        this.isSearchingByCedula = false;
        this.patchFormFromEstudiante(estudiante);
        this.cedulaSearchMessage = 'Datos cargados. Puede editar y guardar.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cedulaSearchMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        this.isSearchingByCedula = false;
        if (err?.status === 404) {
          this.cedulaSearchMessage = '';
        } else {
          this.cedulaSearchMessage = err?.error?.message || err?.message || 'Error al buscar.';
          setTimeout(() => {
            this.cedulaSearchMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Si el usuario viene del landing Movilis con una carrera elegida (query param o state), se pre-rellena el campo carrera.
   * Desde el landing: usar URL con ?carrera=NombreCarrera o navegar con state: { carrera: 'NombreCarrera' }.
   */
  private applyCarreraFromLanding(): void {
    const fromQuery = this.route.snapshot.queryParams['carrera'] as string | undefined;
    const fromState = (history.state as { carrera?: string } | undefined)?.carrera;
    const valorCarrera = (fromQuery ?? fromState)?.trim();
    if (valorCarrera && this.carrerasOpciones.includes(valorCarrera)) {
      this.studentForm.get('carrera')?.setValue(valorCarrera, { emitEvent: false });
      this.cdr.markForCheck();
    }
  }

  /** Sube la foto del título de bachiller al bucket "titulo" y guarda la URL en el formulario. */
  onTituloBachillerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.tituloBachillerError = 'Formato no permitido. Use imagen (JPEG, PNG, WebP, GIF) o PDF.';
      this.cdr.markForCheck();
      return;
    }
    this.tituloBachillerError = '';
    this.tituloBachillerUploading = true;
    this.cdr.markForCheck();
    this.estudianteService.uploadTituloBachiller(file).pipe(
      finalize(() => {
        this.tituloBachillerUploading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: (res) => {
        this.studentForm.get('tituloBachiller')?.setValue(res.url, { emitEvent: true });
        input.value = '';
      },
      error: (err) => {
        this.tituloBachillerError = err?.error?.message || err?.message || 'Error al subir el archivo.';
      },
    });
  }

  /** Quita el documento de título de bachiller: lo elimina del bucket y limpia el campo. */
  removeTituloBachiller(fileInput: HTMLInputElement): void {
    const url = this.studentForm.get('tituloBachiller')?.value;
    if (!url) {
      this.studentForm.get('tituloBachiller')?.setValue('');
      if (fileInput) fileInput.value = '';
      this.cdr.markForCheck();
      return;
    }
    this.tituloBachillerError = '';
    this.estudianteService.deleteTituloBachiller(url).subscribe({
      next: () => {
        this.studentForm.get('tituloBachiller')?.setValue('');
        if (fileInput) fileInput.value = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.tituloBachillerError = err?.error?.message || err?.message || 'No se pudo eliminar el archivo del servidor.';
        this.cdr.markForCheck();
      },
    });
  }

  /** Sube imagen del croquis de vivienda al bucket "maps". */
  onCroquisFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.croquisError = 'Solo se permiten imágenes (JPEG, PNG, WebP, GIF).';
      this.cdr.markForCheck();
      return;
    }
    this.croquisError = '';
    this.croquisUploading = true;
    this.cdr.markForCheck();
    this.estudianteService.uploadCroquisVivienda(file).pipe(
      finalize(() => {
        this.croquisUploading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: (res) => {
        this.studentForm.get('croquisViviendaUrl')?.setValue(res.url, { emitEvent: true });
        input.value = '';
      },
      error: (err) => {
        this.croquisError = err?.error?.message || err?.message || 'Error al subir la imagen.';
      },
    });
  }

  /** Marca o desmarca un servicio disponible (valores guardados como lista separada por comas). */
  toggleServicio(value: string): void {
    const control = this.studentForm.get('serviciosDisponibles');
    if (!control) return;
    const current = (control.value || '').toString().trim();
    const list = current ? current.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const idx = list.indexOf(value);
    if (idx === -1) list.push(value);
    else list.splice(idx, 1);
    control.setValue(list.join(', '), { emitEvent: true });
  }

  isServicioSelected(value: string): boolean {
    const current = (this.studentForm.get('serviciosDisponibles')?.value || '').toString();
    const list = current.split(',').map((s: string) => s.trim());
    return list.includes(value);
  }

  /** Marca o desmarca un tipo de violencia (solo visible si conductas violentas = Sí). */
  toggleTipoViolencia(value: string): void {
    const control = this.studentForm.get('tipoViolenciaFamiliar');
    if (!control) return;
    const current = (control.value || '').toString().trim();
    const list = current ? current.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const idx = list.indexOf(value);
    if (idx === -1) list.push(value);
    else list.splice(idx, 1);
    control.setValue(list.join(', '), { emitEvent: true });
  }

  isTipoViolenciaSelected(value: string): boolean {
    const current = (this.studentForm.get('tipoViolenciaFamiliar')?.value || '').toString();
    const list = current.split(',').map((s: string) => s.trim());
    return list.includes(value);
  }

  /** Quita el croquis: lo elimina del bucket maps y limpia el campo. */
  removeCroquis(fileInput: HTMLInputElement): void {
    const url = this.studentForm.get('croquisViviendaUrl')?.value;
    if (!url) {
      this.studentForm.get('croquisViviendaUrl')?.setValue('');
      if (fileInput) fileInput.value = '';
      this.cdr.markForCheck();
      return;
    }
    this.croquisError = '';
    this.estudianteService.deleteCroquisVivienda(url).subscribe({
      next: () => {
        this.studentForm.get('croquisViviendaUrl')?.setValue('');
        if (fileInput) fileInput.value = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.croquisError = err?.error?.message || err?.message || 'No se pudo eliminar la imagen.';
        this.cdr.markForCheck();
      },
    });
  }

  // Configurar conversión automática a mayúsculas en campos de texto
  setupAutoUppercase(): void {
    const uppercaseFields = ['primerApellido', 'segundoApellido', 'primerNombre', 'segundoNombre'];
    uppercaseFields.forEach(fieldName => {
      const control = this.studentForm.get(fieldName);
      control?.valueChanges.subscribe((value: string) => {
        if (value && value !== 'NA') {
          const upperValue = value.toUpperCase();
          if (value !== upperValue) {
            control!.setValue(upperValue, { emitEvent: false });
          }
        }
      });
    });
  }

  /** Convierte "na", "Na", "nA" o " NA " a "NA" en campos que aceptan NA */
  setupNormalizeNA(): void {
    const naFields = [
      'segundoApellido', 'segundoNombre', 'alergias', 'medicamentos', 'enfermedadCatastrofica',
      'correoElectronico', 'direccionDomicilio', 'correoInstitucional', 'lugarResidencia',
      'carrera', 'disenoCurricular', 'periodoAcademico', 'nombreColegioProcedencia', 'tituloBachiller',
      'financiamientoQuienes', 'referenciaDomiciliaria', 'barrioSector', 'coordenadasVivienda',
      'croquisViviendaUrl', 'tipoPropiedadVivienda', 'estructuraVivienda', 'estructuraViviendaEspecifique', 'tipoVivienda', 'serviciosDisponibles',
      'comparteHabitacion', 'conQuienVive', 'tamanoViviendaSuficiente', 'dinamicaFamiliar',
      'violenciaFamiliar', 'tipoViolenciaFamiliar', 'estudianteCabezaFamiliar',
      'familiaDiscapacidadEnfermedadCatastrofica', 'familiaProblemaSalud', 'familiaParentesco',
      'familiaServiciosMedicos', 'familiaServiciosMedicosDetalle',
      'referenciaPersonalNombre', 'referenciaPersonalParentesco', 'referenciaPersonalTelefono',
      'numeroConvencional', 'anioGraduacion', 'cantidadBanos', 'cantidadHabitaciones',
      'egresoVivienda', 'egresoAlimentacion', 'egresoEducacion', 'egresoIndumentaria',
      'egresoTransporte', 'egresoSalud', 'egresoServiciosBasicos', 'egresoOtros', 'totalEgresos',
      'ingresoTotalHogar', 'porcentajeDiscapacidad', 'numCarnetConadis', 'nroHorasPracticasPreprofesionalesPorPeriodo',
      'montoBeca', 'montoAyudaEconomica', 'montoCreditoEducativo'
    ];
    naFields.forEach(fieldName => {
      const control = this.studentForm.get(fieldName);
      control?.valueChanges.subscribe((value: unknown) => {
        if (value != null && String(value).trim().toUpperCase() === 'NA') {
          control!.setValue('NA', { emitEvent: false });
        }
      });
    });
    this.attachNormalizeNAToComposicionIngresos();
  }

  private attachNormalizeNAToComposicionIngresos(): void {
    const comp = this.studentForm.get('composicionFamiliar') as FormArray;
    const ing = this.studentForm.get('ingresosFamiliares') as FormArray;
    const compFields = ['nombresApellidos', 'cedulaIdentidad', 'estadoCivil', 'parentesco', 'nivelEstudios', 'titulo', 'laborOcupacion'];
    const ingFields = ['nombresApellidos', 'parentesco', 'actividadLaboral', 'ingresoMensual', 'ingresosExtras', 'total'];
    comp?.controls?.forEach((row: AbstractControl) => {
      compFields.forEach(name => {
        row.get(name)?.valueChanges.subscribe((val: unknown) => {
          if (val != null && String(val).trim().toUpperCase() === 'NA') {
            row.get(name)!.setValue('NA', { emitEvent: false });
          }
        });
      });
    });
    ing?.controls?.forEach((row: AbstractControl) => {
      ingFields.forEach(name => {
        row.get(name)?.valueChanges.subscribe((val: unknown) => {
          if (val != null && String(val).trim().toUpperCase() === 'NA') {
            row.get(name)!.setValue('NA', { emitEvent: false });
          }
        });
      });
    });
  }

  // Configurar guardado automático en localStorage
  setupAutoSave(): void {
    // Guardar datos cuando cambia el formulario (con debounce para no saturar el localStorage)
    let saveTimeout: any;
    this.studentForm.valueChanges.subscribe(() => {
      // Limpiar timeout anterior
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      // Guardar después de 1 segundo de inactividad
      saveTimeout = setTimeout(() => {
        this.saveFormData();
      }, 1000);
    });

    // Guardar el paso actual cuando cambia
    // Necesitamos usar un getter para currentStep o suscribirnos a sus cambios
    // Por ahora lo guardaremos cuando se cambie de paso
  }

  // Guardar datos del formulario en localStorage
  saveFormData(): void {
    try {
      const formData = this.studentForm.getRawValue();
      // Guardar datos del formulario
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formData));
      // Guardar paso actual
      localStorage.setItem(this.STORAGE_STEP_KEY, JSON.stringify(this.currentStep));
      // Guardar valores de búsqueda
      const searchData = {
        paisNacionalidadSearch: this.paisNacionalidadSearch,
        paisResidenciaSearch: this.paisResidenciaSearch,
        provinciaNacimientoSearch: this.provinciaNacimientoSearch,
        cantonNacimientoSearch: this.cantonNacimientoSearch,
        provinciaResidenciaSearch: this.provinciaResidenciaSearch,
        cantonResidenciaSearch: this.cantonResidenciaSearch
      };
      localStorage.setItem('student_form_search_data', JSON.stringify(searchData));
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error);
    }
  }

  // Cargar datos guardados del localStorage
  loadSavedData(): void {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      const savedStep = localStorage.getItem(this.STORAGE_STEP_KEY);
      const savedSearchData = localStorage.getItem('student_form_search_data');

      if (savedData) {
        const formData = JSON.parse(savedData);
        // Parse estructura vivienda si viene "OTRO: especificación"
        if (formData.estructuraVivienda && String(formData.estructuraVivienda).startsWith('OTRO:')) {
          const spec = String(formData.estructuraVivienda).replace(/^OTRO:\s*/i, '').trim();
          formData.estructuraVivienda = 'OTRO';
          formData.estructuraViviendaEspecifique = spec;
        }
        // Restaurar datos del formulario
        this.studentForm.patchValue(formData, { emitEvent: false });
        
        // Restaurar valores de búsqueda
        if (savedSearchData) {
          const searchData = JSON.parse(savedSearchData);
          this.paisNacionalidadSearch = searchData.paisNacionalidadSearch || '';
          this.paisResidenciaSearch = searchData.paisResidenciaSearch || '';
          this.provinciaNacimientoSearch = searchData.provinciaNacimientoSearch || '';
          this.cantonNacimientoSearch = searchData.cantonNacimientoSearch || '';
          this.provinciaResidenciaSearch = searchData.provinciaResidenciaSearch || '';
          this.cantonResidenciaSearch = searchData.cantonResidenciaSearch || '';
        }

        // Restaurar paso actual
        if (savedStep) {
          const step = parseInt(JSON.parse(savedStep), 10);
          if (step >= 0 && step < this.totalSteps) {
            this.currentStep = step;
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del localStorage:', error);
    }
  }

  // Limpiar datos guardados del localStorage
  clearSavedData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_STEP_KEY);
      localStorage.removeItem('student_form_search_data');
    } catch (error) {
      console.error('Error al limpiar datos del localStorage:', error);
    }
  }

  loadEnums() {
    this.isLoadingEnums = true;
    // Deshabilitar todos los controles que dependen de enums
    this.disableEnumDependentControls();
    
    this.enumsService.getEnums().subscribe({
      next: (enums: EnumsResponse) => {
        this.enums = enums;
        // Inicializar listas filtradas vacías (no mostrar dropdowns automáticamente)
        this.filteredPaisesNacionalidad = [];
        this.filteredPaisesResidencia = [];
        this.filteredProvinciasNacimiento = [];
        this.filteredCantonesNacimiento = [];
        this.filteredProvinciasResidencia = [];
        this.filteredCantonesResidencia = [];
        
        // Ocultar todos los dropdowns inicialmente
        this.showPaisesNacionalidad = false;
        this.showPaisesResidencia = false;
        this.showProvinciasNacimiento = false;
        this.showCantonesNacimiento = false;
        this.showProvinciasResidencia = false;
        this.showCantonesResidencia = false;
        
        // Inicializar valores de búsqueda si hay valores seleccionados
        const formValue = this.studentForm.getRawValue();
        if (formValue.paisNacionalidadId) {
          this.paisNacionalidadSearch = this.getEnumLabel(formValue.paisNacionalidadId);
        }
        if (formValue.paisResidenciaId) {
          this.paisResidenciaSearch = this.getEnumLabel(formValue.paisResidenciaId);
        }
        if (formValue.provinciaNacimientoId) {
          this.provinciaNacimientoSearch = this.getEnumLabel(formValue.provinciaNacimientoId);
        }
        if (formValue.cantonNacimientoId) {
          this.cantonNacimientoSearch = this.getEnumLabel(formValue.cantonNacimientoId);
        }
        if (formValue.provinciaResidenciaId) {
          this.provinciaResidenciaSearch = this.getEnumLabel(formValue.provinciaResidenciaId);
        }
        if (formValue.cantonResidenciaId) {
          this.cantonResidenciaSearch = this.getEnumLabel(formValue.cantonResidenciaId);
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
      return formValue.etniaId !== 'INDÍGENA';
    }
    
    return false;
  }

  // Métodos para filtrar países
  filterPaisesNacionalidad(searchTerm: string) {
    if (!this.enums?.Pais) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredPaisesNacionalidad = [...this.enums.Pais];
    } else {
      this.filteredPaisesNacionalidad = this.enums.Pais.filter(pais => {
        const label = this.getEnumLabel(pais);
        return this.normalizeText(label).includes(term) ||
               this.normalizeText(pais).includes(term);
      });
    }
    // Mostrar dropdown solo si hay texto
    this.showPaisesNacionalidad = term.length > 0;
  }

  filterPaisesResidencia(searchTerm: string) {
    if (!this.enums?.Pais) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredPaisesResidencia = [...this.enums.Pais];
    } else {
      this.filteredPaisesResidencia = this.enums.Pais.filter(pais => {
        const label = this.getEnumLabel(pais);
        return this.normalizeText(label).includes(term) ||
               this.normalizeText(pais).includes(term);
      });
    }
    // Mostrar dropdown solo si hay texto
    this.showPaisesResidencia = term.length > 0;
  }

  // Métodos para filtrar provincias
  filterProvinciasNacimiento(searchTerm: string) {
    if (!this.enums?.Provincia) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredProvinciasNacimiento = [...this.enums.Provincia];
    } else {
      this.filteredProvinciasNacimiento = this.enums.Provincia.filter(provincia => {
        const label = this.getEnumLabel(provincia);
        return this.normalizeText(label).includes(term) ||
               this.normalizeText(provincia).includes(term);
      });
    }
    // Mostrar dropdown solo si hay texto
    this.showProvinciasNacimiento = term.length > 0;
  }

  filterProvinciasResidencia(searchTerm: string) {
    if (!this.enums?.Provincia) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredProvinciasResidencia = [...this.enums.Provincia];
    } else {
      this.filteredProvinciasResidencia = this.enums.Provincia.filter(provincia => {
        const label = this.getEnumLabel(provincia);
        return this.normalizeText(label).includes(term) ||
               this.normalizeText(provincia).includes(term);
      });
    }
    // Mostrar dropdown solo si hay texto
    this.showProvinciasResidencia = term.length > 0;
  }

  // Métodos para filtrar cantones
  filterCantonesNacimiento(searchTerm: string) {
    if (!this.enums?.Canton) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredCantonesNacimiento = [...this.enums.Canton];
    } else {
      this.filteredCantonesNacimiento = this.enums.Canton.filter(canton => {
        const label = this.getEnumLabel(canton);
        return this.normalizeText(label).includes(term) ||
               this.normalizeText(canton).includes(term);
      });
    }
    // Mostrar dropdown solo si hay texto
    this.showCantonesNacimiento = term.length > 0;
  }

  filterCantonesResidencia(searchTerm: string) {
    if (!this.enums?.Canton) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredCantonesResidencia = [...this.enums.Canton];
    } else {
      this.filteredCantonesResidencia = this.enums.Canton.filter(canton => {
        const label = this.getEnumLabel(canton);
        return this.normalizeText(label).includes(term) ||
               this.normalizeText(canton).includes(term);
      });
    }
    // Mostrar dropdown solo si hay texto
    this.showCantonesResidencia = term.length > 0;
  }

  // Método para seleccionar un país
  selectPaisNacionalidad(pais: string) {
    this.studentForm.get('paisNacionalidadId')?.setValue(pais);
    this.paisNacionalidadSearch = this.getEnumLabel(pais);
    this.filteredPaisesNacionalidad = [];
    this.showPaisesNacionalidad = false;
  }

  selectPaisResidencia(pais: string) {
    this.studentForm.get('paisResidenciaId')?.setValue(pais);
    this.paisResidenciaSearch = this.getEnumLabel(pais);
    this.filteredPaisesResidencia = [];
    this.showPaisesResidencia = false;
  }

  // Método para seleccionar una provincia
  selectProvinciaNacimiento(provincia: string) {
    this.studentForm.get('provinciaNacimientoId')?.setValue(provincia);
    this.provinciaNacimientoSearch = this.getEnumLabel(provincia);
    this.filteredProvinciasNacimiento = [];
    this.showProvinciasNacimiento = false;
  }

  selectProvinciaResidencia(provincia: string) {
    this.studentForm.get('provinciaResidenciaId')?.setValue(provincia);
    this.provinciaResidenciaSearch = this.getEnumLabel(provincia);
    this.filteredProvinciasResidencia = [];
    this.showProvinciasResidencia = false;
  }

  // Método para seleccionar un cantón
  selectCantonNacimiento(canton: string) {
    this.studentForm.get('cantonNacimientoId')?.setValue(canton);
    this.cantonNacimientoSearch = this.getEnumLabel(canton);
    this.filteredCantonesNacimiento = [];
    this.showCantonesNacimiento = false;
  }

  selectCantonResidencia(canton: string) {
    this.studentForm.get('cantonResidenciaId')?.setValue(canton);
    this.cantonResidenciaSearch = this.getEnumLabel(canton);
    this.filteredCantonesResidencia = [];
    this.showCantonesResidencia = false;
  }

  // Métodos para manejar eventos de input de países
  onPaisNacionalidadInput(event: any) {
    const value = event.target.value;
    this.paisNacionalidadSearch = value;
    this.filterPaisesNacionalidad(value);
    this.showPaisesNacionalidad = value.length > 0;
  }

  onPaisNacionalidadFocus() {
    if (this.paisNacionalidadSearch.length > 0) {
      this.filterPaisesNacionalidad(this.paisNacionalidadSearch);
      this.showPaisesNacionalidad = true;
    }
  }

  onPaisNacionalidadBlur() {
    const selectedValue = this.studentForm.get('paisNacionalidadId')?.value;
    if (selectedValue) {
      this.paisNacionalidadSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredPaisesNacionalidad = [];
      this.showPaisesNacionalidad = false;
    }, 200);
  }

  onPaisResidenciaInput(event: any) {
    const value = event.target.value;
    this.paisResidenciaSearch = value;
    this.filterPaisesResidencia(value);
    this.showPaisesResidencia = value.length > 0;
  }

  onPaisResidenciaFocus() {
    if (this.paisResidenciaSearch.length > 0) {
      this.filterPaisesResidencia(this.paisResidenciaSearch);
      this.showPaisesResidencia = true;
    }
  }

  onPaisResidenciaBlur() {
    const selectedValue = this.studentForm.get('paisResidenciaId')?.value;
    if (selectedValue) {
      this.paisResidenciaSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredPaisesResidencia = [];
      this.showPaisesResidencia = false;
    }, 200);
  }

  // Métodos para manejar eventos de input
  onProvinciaNacimientoInput(event: any) {
    const value = event.target.value;
    this.provinciaNacimientoSearch = value;
    this.filterProvinciasNacimiento(value);
    this.showProvinciasNacimiento = value.length > 0;
  }

  onProvinciaNacimientoFocus() {
    if (this.provinciaNacimientoSearch.length > 0) {
      this.filterProvinciasNacimiento(this.provinciaNacimientoSearch);
      this.showProvinciasNacimiento = true;
    }
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
      this.showProvinciasNacimiento = false;
    }, 200);
  }

  onCantonNacimientoInput(event: any) {
    const value = event.target.value;
    this.cantonNacimientoSearch = value;
    this.filterCantonesNacimiento(value);
    this.showCantonesNacimiento = value.length > 0;
  }

  onCantonNacimientoFocus() {
    if (this.cantonNacimientoSearch.length > 0) {
      this.filterCantonesNacimiento(this.cantonNacimientoSearch);
      this.showCantonesNacimiento = true;
    }
  }

  onCantonNacimientoBlur() {
    const selectedValue = this.studentForm.get('cantonNacimientoId')?.value;
    if (selectedValue) {
      this.cantonNacimientoSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredCantonesNacimiento = [];
      this.showCantonesNacimiento = false;
    }, 200);
  }

  onProvinciaResidenciaInput(event: any) {
    const value = event.target.value;
    this.provinciaResidenciaSearch = value;
    this.filterProvinciasResidencia(value);
    this.showProvinciasResidencia = value.length > 0;
  }

  onProvinciaResidenciaFocus() {
    if (this.provinciaResidenciaSearch.length > 0) {
      this.filterProvinciasResidencia(this.provinciaResidenciaSearch);
      this.showProvinciasResidencia = true;
    }
  }

  onProvinciaResidenciaBlur() {
    const selectedValue = this.studentForm.get('provinciaResidenciaId')?.value;
    if (selectedValue) {
      this.provinciaResidenciaSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredProvinciasResidencia = [];
      this.showProvinciasResidencia = false;
    }, 200);
  }

  onCantonResidenciaInput(event: any) {
    const value = event.target.value;
    this.cantonResidenciaSearch = value;
    this.filterCantonesResidencia(value);
    this.showCantonesResidencia = value.length > 0;
  }

  onCantonResidenciaFocus() {
    if (this.cantonResidenciaSearch.length > 0) {
      this.filterCantonesResidencia(this.cantonResidenciaSearch);
      this.showCantonesResidencia = true;
    }
  }

  onCantonResidenciaBlur() {
    const selectedValue = this.studentForm.get('cantonResidenciaId')?.value;
    if (selectedValue) {
      this.cantonResidenciaSearch = this.getEnumLabel(selectedValue);
    }
    setTimeout(() => {
      this.filteredCantonesResidencia = [];
      this.showCantonesResidencia = false;
    }, 200);
  }

  // Método auxiliar para obtener etiquetas más amigables de los enums
  // Función para normalizar texto removiendo tildes y convirtiendo a minúsculas
  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remueve tildes y diacríticos
  }

  getEnumLabel(enumValue: string): string {
    if (!enumValue) return '';
    
    // Formateo especial para tipos de sangre
    if (enumValue.startsWith('A_POSITIVO') || enumValue.startsWith('A_NEGATIVO') || 
        enumValue.startsWith('B_POSITIVO') || enumValue.startsWith('B_NEGATIVO') ||
        enumValue.startsWith('AB_POSITIVO') || enumValue.startsWith('AB_NEGATIVO') ||
        enumValue.startsWith('O_POSITIVO') || enumValue.startsWith('O_NEGATIVO')) {
      const parts = enumValue.split('_');
      const tipo = parts[0]; // A, B, AB, O
      const rh = parts[1]; // POSITIVO o NEGATIVO
      const signo = rh === 'POSITIVO' ? '+' : '-';
      return tipo + signo;
    }
    
    // Formateo normal para otros enums
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

  /** Solo letras (incluye acentos, ñ, espacios). Permite vacío o "NA". */
  static lettersOnlyValidator(allowNA = false): ValidatorFn {
    const lettersSpaces = /^[A-Za-zÁ-úÑñÜü\s]*$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const v = String(control.value).trim();
      if (allowNA && (v === 'NA' || v === '')) return null;
      if (!lettersSpaces.test(v)) {
        return { lettersOnly: { value: control.value } };
      }
      return null;
    };
  }

  /** Solo números (dígitos). Permite vacío o "NA" si allowNA. */
  static numbersOnlyValidator(allowNA = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const v = String(control.value).trim();
      if (allowNA && v === 'NA') return null;
      if (!/^\d+$/.test(v)) {
        return { numbersOnly: { value: control.value } };
      }
      return null;
    };
  }

  /** Acepta solo letras/espacios o exactamente "NA". */
  static lettersOrNAValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const v = String(control.value).trim().toUpperCase();
      if (v === 'NA') return null;
      if (!/^[A-Za-zÁ-úÑñÜü\s]+$/.test(control.value)) {
        return { lettersOrNA: { value: control.value } };
      }
      return null;
    };
  }

  /** Acepta solo números o "NA". */
  static numbersOrNAValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const v = String(control.value).trim().toUpperCase();
      if (v === 'NA') return null;
      if (!/^\d+$/.test(String(control.value).trim())) {
        return { numbersOrNA: { value: control.value } };
      }
      return null;
    };
  }

  /** Acepta vacío, "NA" o número (entero o decimal). */
  static decimalOrNAValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const v = String(control.value).trim().toUpperCase();
      if (v === 'NA') return null;
      const num = parseFloat(String(control.value).trim().replace(',', '.'));
      if (isNaN(num)) {
        return { decimalOrNA: { value: control.value } };
      }
      return null;
    };
  }

  /** Si hay valor numérico, debe ser >= 0. Acepta vacío o "NA". */
  static nonNegativeNumberOrEmptyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const v = String(control.value).trim().toUpperCase();
      if (v === 'NA') return null;
      const num = parseFloat(String(control.value).trim().replace(',', '.'));
      if (isNaN(num) || num < 0) {
        return { nonNegative: { value: control.value } };
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
    // Solo se habilita si etniaId = "INDÍGENA", si no se establece automáticamente "NO_APLICA"
    this.studentForm.get('etniaId')?.valueChanges.subscribe((value: any) => {
      const pueblo = this.studentForm.get('pueblonacionalidadId');
      if (value === 'INDÍGENA') {
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

    // Si conductas violentas no es "Sí", limpiar tipo de violencia
    this.studentForm.get('violenciaFamiliar')?.valueChanges.subscribe((value: unknown) => {
      if (value !== 'SI') {
        this.studentForm.get('tipoViolenciaFamiliar')?.setValue('', { emitEvent: false });
      }
    });

    // Familia con discapacidad/enfermedad catastrófica: si Sí → requerir Problema de salud y mostrar Parentesco (select)
    const applyFamiliaDiscapacidadValidators = (value: string) => {
      const problema = this.studentForm.get('familiaProblemaSalud');
      const parentesco = this.studentForm.get('familiaParentesco');
      if (value === 'SI') {
        problema?.setValidators([Validators.required, Validators.maxLength(200)]);
        parentesco?.setValidators([Validators.required]);
      } else {
        problema?.setValue('', { emitEvent: false });
        parentesco?.setValue('', { emitEvent: false });
        problema?.clearValidators();
        parentesco?.clearValidators();
      }
      problema?.updateValueAndValidity({ emitEvent: false });
      parentesco?.updateValueAndValidity({ emitEvent: false });
    };
    this.studentForm.get('familiaDiscapacidadEnfermedadCatastrofica')?.valueChanges.subscribe(applyFamiliaDiscapacidadValidators);
    applyFamiliaDiscapacidadValidators(this.studentForm.get('familiaDiscapacidadEnfermedadCatastrofica')?.value);

    // Servicios médicos: si No, limpiar detalle y opciones
    this.studentForm.get('familiaServiciosMedicos')?.valueChanges.subscribe((value: string) => {
      if (value !== 'SI') {
        this.studentForm.get('familiaServiciosMedicosDetalle')?.setValue('', { emitEvent: false });
        this.studentForm.get('familiaServicioIees')?.setValue(false, { emitEvent: false });
        this.studentForm.get('familiaServicioSeguroPrivado')?.setValue(false, { emitEvent: false });
        this.studentForm.get('familiaServicioSeguroCampesino')?.setValue(false, { emitEvent: false });
        this.studentForm.get('familiaServicioOtro')?.setValue(false, { emitEvent: false });
        this.studentForm.get('familiaServicioOtroEspecifique')?.setValue('', { emitEvent: false });
      }
    });

    // Validación condicional para provincias y cantones de nacimiento
    // Solo se habilitan si paisNacionalidadId = "ECUADOR"
    this.studentForm.get('paisNacionalidadId')?.valueChanges.subscribe((value: any) => {
      const provinciaNacimiento = this.studentForm.get('provinciaNacimientoId');
      const cantonNacimiento = this.studentForm.get('cantonNacimientoId');
      
      // Actualizar valor de búsqueda del país
      if (value) {
        this.paisNacionalidadSearch = this.getEnumLabel(value);
      } else {
        this.paisNacionalidadSearch = '';
      }
      
      if (value === 'ECUADOR') {
        // Si el país es Ecuador, habilitar campos
        provinciaNacimiento?.enable({ emitEvent: false });
        cantonNacimiento?.enable({ emitEvent: false });
      } else {
        // Si el país no es Ecuador, deshabilitar y establecer valores como NA
        provinciaNacimiento?.setValue('NA', { emitEvent: false });
        cantonNacimiento?.setValue('NA', { emitEvent: false });
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
      
      // Actualizar valor de búsqueda del país
      if (value) {
        this.paisResidenciaSearch = this.getEnumLabel(value);
      } else {
        this.paisResidenciaSearch = '';
      }
      
      if (value === 'ECUADOR') {
        // Si el país es Ecuador, habilitar campos
        provinciaResidencia?.enable({ emitEvent: false });
        cantonResidencia?.enable({ emitEvent: false });
        provinciaResidencia?.setValidators([Validators.required]);
        cantonResidencia?.setValidators([Validators.required]);
      } else {
        // Si el país no es Ecuador, deshabilitar y establecer valores como NA
        provinciaResidencia?.setValue('NA', { emitEvent: false });
        cantonResidencia?.setValue('NA', { emitEvent: false });
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

      // 3. primerApellido (Caracter 60, MAYÚSCULAS, solo letras, obligatorio)
      primerApellido: ['', [
        Validators.required,
        Validators.maxLength(60),
        StudentForm.uppercaseValidator(),
        StudentForm.lettersOnlyValidator(false)
      ]],

      // 4. segundoApellido (Caracter 60, obligatorio o "NA", solo letras o NA)
      segundoApellido: ['', [
        StudentForm.naOrRequiredValidator(),
        Validators.maxLength(60),
        StudentForm.lettersOrNAValidator(),
        (control: AbstractControl) => {
          if (control.value && control.value !== 'NA' && control.value.length > 60) {
            return { maxlength: { requiredLength: 60, actualLength: control.value.length } };
          }
          return null;
        }
      ]],

      // 5. primerNombre (Caracter 60, MAYÚSCULAS, solo letras, obligatorio)
      primerNombre: ['', [
        Validators.required,
        Validators.maxLength(60),
        StudentForm.uppercaseValidator(),
        StudentForm.lettersOnlyValidator(false)
      ]],

      // 6. segundoNombre (Caracter 60, obligatorio o "NA", solo letras o NA)
      segundoNombre: ['', [
        StudentForm.naOrRequiredValidator(),
        Validators.maxLength(60),
        StudentForm.lettersOrNAValidator(),
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

      // 11. pueblonacionalidadId (Enum, obligatorio SOLO si etniaId = "INDÍGENA", si no "NO_APLICA")
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

      // Campos adicionales contacto y ubicación
      direccionDomicilio: [''],
      correoInstitucional: [''],
      lugarResidencia: [''],
      carrera: [''],
      disenoCurricular: [''],
      periodoAcademico: [''],
      alergias: [''],
      medicamentos: [''],
      referenciaPersonalNombre: ['', [StudentForm.lettersOnlyValidator(true), Validators.maxLength(120)]],
      referenciaPersonalParentesco: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(60)]],
      referenciaPersonalTelefono: ['', [StudentForm.numbersOrNAValidator(), Validators.maxLength(15)]],
      enfermedadCatastrofica: [''],

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
      numeroConvencional: ['', [StudentForm.numbersOrNAValidator(), Validators.maxLength(15)]],
      presentaCarnetDiscapacidad: [''],
      presentaAlergiaImportante: [''],
      nombreColegioProcedencia: [''],
      tituloBachiller: [''],
      anioGraduacion: ['', [StudentForm.numbersOrNAValidator(), Validators.maxLength(4)]],
      financiamientoQuienes: [''],
      referenciaDomiciliaria: [''],
      barrioSector: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(100)]],
      zonaVivienda: [''],
      coordenadasVivienda: [''],
      croquisViviendaUrl: [''],
      tipoPropiedadVivienda: [''],
      estructuraVivienda: [''],
      estructuraViviendaEspecifique: ['', [Validators.maxLength(120)]],
      tipoVivienda: [''],
      serviciosDisponibles: [''],
      cantidadBanos: ['', [StudentForm.numbersOrNAValidator(), Validators.maxLength(2)]],
      cantidadHabitaciones: ['', [StudentForm.numbersOrNAValidator(), Validators.maxLength(2)]],
      comparteHabitacion: [''],
      conQuienVive: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(200)]],
      tamanoViviendaSuficiente: [''],
      dinamicaFamiliar: [''],
      violenciaFamiliar: [''],
      tipoViolenciaFamiliar: [''],
      estudianteCabezaFamiliar: [''],
      familiaDiscapacidadEnfermedadCatastrofica: [''],
      familiaProblemaSalud: [''],
      familiaParentesco: [''],
      familiaServiciosMedicos: [''],
      familiaServiciosMedicosDetalle: [''],
      familiaServicioIees: [false],
      familiaServicioSeguroPrivado: [false],
      familiaServicioSeguroCampesino: [false],
      familiaServicioOtro: [false],
      familiaServicioOtroEspecifique: [''],
      egresoVivienda: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      egresoAlimentacion: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      egresoEducacion: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      egresoIndumentaria: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      egresoTransporte: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      egresoSalud: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      egresoServiciosBasicos: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      egresoOtros: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      totalEgresos: [{ value: '', disabled: false }],

      composicionFamiliar: this.fb.array([]),
      ingresosFamiliares: this.fb.array([]),

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

  createComposicionFamiliarGroup(): FormGroup {
    return this.fb.group({
      nombresApellidos: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(200)]],
      fechaNacimiento: [''],
      cedulaIdentidad: ['', [StudentForm.numbersOrNAValidator(), Validators.maxLength(13)]],
      estadoCivil: [''],
      parentesco: [''],
      nivelEstudios: [''],
      titulo: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(120)]],
      laborOcupacion: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(120)]],
    });
  }

  addComposicionFamiliar(): void {
    const arr = this.studentForm.get('composicionFamiliar') as FormArray;
    arr.push(this.createComposicionFamiliarGroup());
    const row = arr.at(arr.length - 1);
    ['nombresApellidos', 'cedulaIdentidad', 'estadoCivil', 'parentesco', 'nivelEstudios', 'titulo', 'laborOcupacion'].forEach(name => {
      row.get(name)?.valueChanges.subscribe((val: unknown) => {
        if (val != null && String(val).trim().toUpperCase() === 'NA') {
          row.get(name)!.setValue('NA', { emitEvent: false });
        }
      });
    });
  }

  removeComposicionFamiliar(index: number): void {
    const arr = this.studentForm.get('composicionFamiliar') as FormArray;
    if (arr.length > 0) arr.removeAt(index);
  }

  get composicionFamiliarArray(): FormArray {
    return this.studentForm.get('composicionFamiliar') as FormArray;
  }

  createIngresoFamiliarGroup(): FormGroup {
    return this.fb.group({
      nombresApellidos: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(200)]],
      parentesco: [''],
      actividadLaboral: ['', [StudentForm.lettersOrNAValidator(), Validators.maxLength(120)]],
      ingresoMensual: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      ingresosExtras: ['', [StudentForm.decimalOrNAValidator(), Validators.maxLength(15), StudentForm.nonNegativeNumberOrEmptyValidator()]],
      total: [{ value: '', disabled: false }],
    });
  }

  /** Parsea valor de ingreso a número (vacío o NA = 0). */
  private static parseIngresoVal(v: unknown): number {
    if (v == null || v === '') return 0;
    const s = String(v).trim().toUpperCase();
    if (s === 'NA') return 0;
    const n = parseFloat(String(v).trim().replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  /** Recalcula total de una fila de ingresos: ingresoMensual + ingresosExtras. */
  private updateIngresoTotalRow(row: FormGroup): void {
    const ing = StudentForm.parseIngresoVal(row.get('ingresoMensual')?.value);
    const ext = StudentForm.parseIngresoVal(row.get('ingresosExtras')?.value);
    const total = ing + ext;
    row.get('total')?.setValue(total === 0 ? '' : total, { emitEvent: false });
  }

  addIngresoFamiliar(): void {
    const arr = this.studentForm.get('ingresosFamiliares') as FormArray;
    arr.push(this.createIngresoFamiliarGroup());
    const row = arr.at(arr.length - 1) as FormGroup;
    ['nombresApellidos', 'parentesco', 'actividadLaboral', 'ingresoMensual', 'ingresosExtras'].forEach(name => {
      row.get(name)?.valueChanges.subscribe((val: unknown) => {
        if (val != null && String(val).trim().toUpperCase() === 'NA') {
          row.get(name)!.setValue('NA', { emitEvent: false });
        }
      });
    });
    row.get('ingresoMensual')?.valueChanges.subscribe(() => this.updateIngresoTotalRow(row));
    row.get('ingresosExtras')?.valueChanges.subscribe(() => this.updateIngresoTotalRow(row));
    this.updateIngresoTotalRow(row);
  }

  removeIngresoFamiliar(index: number): void {
    const arr = this.studentForm.get('ingresosFamiliares') as FormArray;
    if (arr.length > 0) arr.removeAt(index);
  }

  get ingresosFamiliaresArray(): FormArray {
    return this.studentForm.get('ingresosFamiliares') as FormArray;
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
      
      let formData = this.getFormDataForBackend();
      
      // Asegurar que los valores numéricos sean realmente números (doble verificación)
      // Manejar valores "NA" o strings inválidos
      if (formData.duracionPeriodoAcademico !== undefined && formData.duracionPeriodoAcademico !== null) {
        const strValue = String(formData.duracionPeriodoAcademico).trim().toUpperCase();
        if (strValue === 'NA' || strValue === '' || strValue === 'NULL') {
          formData.duracionPeriodoAcademico = 1;
        } else {
          formData.duracionPeriodoAcademico = Number(formData.duracionPeriodoAcademico);
          if (isNaN(formData.duracionPeriodoAcademico) || formData.duracionPeriodoAcademico < 1) {
            formData.duracionPeriodoAcademico = 1;
          }
        }
      } else {
        formData.duracionPeriodoAcademico = 1;
      }
      
      if (formData.cantidadMiembrosHogar !== undefined && formData.cantidadMiembrosHogar !== null) {
        const strValue = String(formData.cantidadMiembrosHogar).trim().toUpperCase();
        if (strValue === 'NA' || strValue === '' || strValue === 'NULL') {
          formData.cantidadMiembrosHogar = 1;
        } else {
          formData.cantidadMiembrosHogar = Math.floor(Number(formData.cantidadMiembrosHogar));
          if (isNaN(formData.cantidadMiembrosHogar) || formData.cantidadMiembrosHogar < 1) {
            formData.cantidadMiembrosHogar = 1;
          }
        }
      } else {
        formData.cantidadMiembrosHogar = 1;
      }
      
      console.log('Formulario válido, enviando:', formData);
      console.log('Datos completos del formulario:', JSON.stringify(formData, null, 2));
      console.log('Verificación de tipos numéricos:', {
        duracionPeriodoAcademico: { valor: formData.duracionPeriodoAcademico, tipo: typeof formData.duracionPeriodoAcademico },
        cantidadMiembrosHogar: { valor: formData.cantidadMiembrosHogar, tipo: typeof formData.cantidadMiembrosHogar }
      });
      
      // Asegurar que los valores numéricos sean realmente números (no strings) cuando se envía JSON
      // Crear una copia del objeto para evitar mutar el original
      const jsonData = { ...formData };
      
      // Convertir explícitamente los campos numéricos a números
      if (jsonData.duracionPeriodoAcademico !== undefined && jsonData.duracionPeriodoAcademico !== null) {
        jsonData.duracionPeriodoAcademico = Number(jsonData.duracionPeriodoAcademico);
        if (isNaN(jsonData.duracionPeriodoAcademico) || jsonData.duracionPeriodoAcademico < 1) {
          jsonData.duracionPeriodoAcademico = 1;
        }
      }
      
      if (jsonData.cantidadMiembrosHogar !== undefined && jsonData.cantidadMiembrosHogar !== null) {
        jsonData.cantidadMiembrosHogar = Math.floor(Number(jsonData.cantidadMiembrosHogar));
        if (isNaN(jsonData.cantidadMiembrosHogar) || jsonData.cantidadMiembrosHogar < 1) {
          jsonData.cantidadMiembrosHogar = 1;
        }
      }
      
      // Log final para verificar
      console.log('Enviando JSON - Tipos finales:', {
        duracionPeriodoAcademico: { 
          valor: jsonData.duracionPeriodoAcademico, 
          tipo: typeof jsonData.duracionPeriodoAcademico,
          esNumber: typeof jsonData.duracionPeriodoAcademico === 'number'
        },
        cantidadMiembrosHogar: { 
          valor: jsonData.cantidadMiembrosHogar, 
          tipo: typeof jsonData.cantidadMiembrosHogar,
          esNumber: typeof jsonData.cantidadMiembrosHogar === 'number'
        }
      });
      
      this.estudianteService.guardarPaso(jsonData)
          .pipe(
            finalize(() => {
              console.log('Finalizando petición, desactivando isSubmitting');
              this.isSubmitting = false;
              this.cdr.detectChanges();
            })
          )
          .subscribe({
            next: (response: any) => {
              console.log('Estudiante guardado exitosamente:', response);
              this.isSubmitting = false;
              this.submitError = false;
              this.submitMessage = ' ¡Estudiante guardado exitosamente!';
              this.clearSavedData();
              this.studentForm.reset();
              this.currentStep = 0;
              this.paisNacionalidadSearch = '';
              this.paisResidenciaSearch = '';
              this.provinciaNacimientoSearch = '';
              this.cantonNacimientoSearch = '';
              this.provinciaResidenciaSearch = '';
              this.cantonResidenciaSearch = '';
              this.cdr.detectChanges();
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
              setTimeout(() => {
                this.submitMessage = '';
                this.cdr.detectChanges();
              }, 8000);
            },
            error: (error: any) => {
              console.error('Error al guardar estudiante:', error);
              this.isSubmitting = false;
              this.submitError = true;
              let errorMessage = 'Error al guardar el estudiante.';
              if (error.status === 500) {
                errorMessage = 'Error interno del servidor (500).\n\nPor favor, verifica que todos los campos estén completos correctamente.\nSi el problema persiste, contacta al administrador.';
                if (error.error?.message) {
                  errorMessage += '\n\nDetalle: ' + error.error.message;
                }
              } else if (error.error && Array.isArray(error.error.message)) {
                errorMessage = 'Error de validación:\n' + error.error.message.join('\n');
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.submitMessage = errorMessage;
              this.cdr.detectChanges();
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
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
      direccionDomicilio: 'Dirección Domicilio',
      correoInstitucional: 'Correo Institucional',
      lugarResidencia: 'Lugar Residencia',
      carrera: 'Carrera',
      disenoCurricular: 'Diseño Curricular',
      periodoAcademico: 'Período Académico',
      alergias: 'Alergias',
      medicamentos: 'Medicamentos',
      referenciaPersonalNombre: 'Referencia Personal Nombre',
      referenciaPersonalParentesco: 'Referencia Personal Parentesco',
      referenciaPersonalTelefono: 'Referencia Personal Teléfono',
      enfermedadCatastrofica: 'Enfermedad Catastrófica',
      nivelFormacionPadre: 'Nivel Formación Padre',
      nivelFormacionMadre: 'Nivel Formación Madre',
      ingresoTotalHogar: 'Ingreso Total Hogar',
      cantidadMiembrosHogar: 'Cantidad Miembros Hogar',
    };

    Object.keys(this.studentForm.controls).forEach(key => {
      const control = this.studentForm.get(key);
      if (!control) return;
      // FormArrays: recorrer controles anidados para listar errores por fila
      if (control instanceof FormArray && (key === 'composicionFamiliar' || key === 'ingresosFamiliares')) {
        const arr = control as FormArray;
        const sectionLabel = key === 'composicionFamiliar' ? 'Composición familiar' : 'Ingresos familiares';
        const fieldLabels: Record<string, string> = key === 'composicionFamiliar'
          ? { nombresApellidos: 'Nombres y apellidos', fechaNacimiento: 'Fecha nac.', cedulaIdentidad: 'Cédula', estadoCivil: 'Estado civil', parentesco: 'Parentesco', nivelEstudios: 'Nivel estudios', titulo: 'Título', laborOcupacion: 'Labor u ocupación' }
          : { nombresApellidos: 'Nombres y apellidos', parentesco: 'Parentesco', actividadLaboral: 'Actividad laboral', ingresoMensual: 'Ingreso mensual', ingresosExtras: 'Ingresos extras', total: 'Total' };
        for (let i = 0; i < arr.length; i++) {
          const group = arr.at(i) as FormGroup;
          Object.keys(group.controls).forEach(ctrlName => {
            const ctrl = group.get(ctrlName);
            if (ctrl && ctrl.invalid && ctrl.errors) {
              const path = `${key}.${i}.${ctrlName}`;
              const error = this.getErrorMessageForField(path);
              const label = fieldLabels[ctrlName] || ctrlName;
              camposConErrores.push(`• ${sectionLabel} (fila ${i + 1}) - ${label}: ${error || 'Campo inválido'}`);
            }
          });
        }
        return;
      }
      // Controles normales
      if (control.invalid) {
        const nombreCampo = nombresCampos[key] || key;
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

    const errors = control.errors;
    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (errors['integer'] || errors['integer1Range']) {
      return 'Debe ser un número entero válido';
    }
    if (errors['integer2Range']) {
      return 'Debe ser un número entero de 2 dígitos (1-99)';
    }
    if (errors['integer3Range']) {
      return 'Debe ser un número entero de 3 dígitos (0-999)';
    }
    if (errors['integer4Range']) {
      return 'Debe ser un número entero de 4 dígitos (0-9999)';
    }
    if (errors['integer5Range']) {
      return 'Debe ser un número entero de 5 dígitos (0-99999)';
    }
    if (errors['emailFormat']) {
      return 'Formato de correo electrónico inválido';
    }
    if (errors['numeric']) {
      return 'Debe contener solo números';
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['uppercase']) {
      return 'Debe estar en MAYÚSCULAS';
    }
    if (errors['cedulaFormat']) {
      return 'La cédula debe tener 10 dígitos numéricos';
    }
    if (errors['pasaporteFormat']) {
      return 'El pasaporte debe tener 9 caracteres alfanuméricos';
    }
    if (errors['dateFormat'] || errors['dateInvalid']) {
      return 'Formato de fecha inválido (yyyy-mm-dd)';
    }
    if (errors['length']) {
      return `Debe tener exactamente ${errors['length'].requiredLength} caracteres`;
    }
    if (errors['lettersOnly'] || errors['lettersOrNA']) {
      return 'Solo se permiten letras y espacios';
    }
    if (errors['numbersOnly'] || errors['numbersOrNA']) {
      return 'Solo se permiten números';
    }
    return 'Campo inválido';
  }

  /**
   * Convierte un valor a número, con un valor mínimo por defecto
   * @param value - Valor a convertir (puede ser string, number, null, undefined)
   * @param minValue - Valor mínimo por defecto si el valor es inválido
   * @returns Número válido >= minValue
   */
  parseNumber(value: any, minValue: number = 0): number {
    if (value === null || value === undefined || value === '') {
      return minValue;
    }
    // Convertir a string primero para manejar cualquier tipo, luego a número
    const strValue = String(value).trim().toUpperCase();
    // Verificar si es "NA" o un string que no puede ser parseado
    if (strValue === '' || strValue === 'NA' || strValue === 'NULL' || strValue === 'UNDEFINED') {
      return minValue;
    }
    const num = parseFloat(strValue);
    if (isNaN(num) || num < minValue) {
      return minValue;
    }
    return num;
  }

  /**
   * Convierte un valor a entero, con un valor mínimo por defecto
   * @param value - Valor a convertir (puede ser string, number, null, undefined)
   * @param minValue - Valor mínimo por defecto si el valor es inválido
   * @returns Entero válido >= minValue
   */
  /** Convierte valor numérico o vacío a string para el backend: número como string o 'NA'. */
  toNumOrNAString(v: unknown): string {
    if (v == null || v === '') return 'NA';
    const s = String(v).trim().toUpperCase();
    if (s === 'NA') return 'NA';
    return String(v);
  }

  parseInt(value: any, minValue: number = 0): number {
    if (value === null || value === undefined || value === '') {
      return minValue;
    }
    // Convertir a string primero para manejar cualquier tipo, luego a entero
    const strValue = String(value).trim().toUpperCase();
    // Verificar si es "NA" o un string que no puede ser parseado
    if (strValue === '' || strValue === 'NA' || strValue === 'NULL' || strValue === 'UNDEFINED') {
      return minValue;
    }
    const num = parseInt(strValue, 10);
    if (isNaN(num) || num < minValue) {
      return minValue;
    }
    return num;
  }

  /** Construye familiaServiciosMedicosDetalle desde checkboxes (IEES, Seguro Privado, etc.) + Otro especifique. */
  private buildFamiliaServiciosMedicosDetalle(formValue: any): string {
    if (formValue.familiaServiciosMedicos !== 'SI') return formValue.familiaServiciosMedicosDetalle || 'NA';
    const parts: string[] = [];
    if (formValue.familiaServicioIees) parts.push('IEES');
    if (formValue.familiaServicioSeguroPrivado) parts.push('Seguro Privado');
    if (formValue.familiaServicioSeguroCampesino) parts.push('Seguro Campesino');
    if (formValue.familiaServicioOtro && formValue.familiaServicioOtroEspecifique) {
      parts.push('Otro: ' + String(formValue.familiaServicioOtroEspecifique).trim());
    } else if (formValue.familiaServicioOtro) {
      parts.push('Otro');
    }
    return parts.length ? parts.join(', ') : (formValue.familiaServiciosMedicosDetalle || 'NA');
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
      porcentajeDiscapacidad: String(formValue.porcentajeDiscapacidad || 'NA'),
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
      // Provincia y cantón de nacimiento: 
      // Si país != ECUADOR, provincia debe ser undefined (null en DB) y cantón debe ser 'NA'
      // Si país == ECUADOR, usar el valor del formulario o undefined si está vacío
      provinciaNacimientoId: formValue.paisNacionalidadId === 'ECUADOR'
        ? (formValue.provinciaNacimientoId || undefined)
        : undefined,
      cantonNacimientoId: formValue.paisNacionalidadId === 'ECUADOR'
        ? (formValue.cantonNacimientoId || 'NA')
        : 'NA',
      paisResidenciaId: formValue.paisResidenciaId || '',
      // Provincia y cantón de residencia:
      // Si país != ECUADOR, provincia debe ser undefined (null en DB) y cantón debe ser 'NA'
      // Si país == ECUADOR, usar el valor del formulario o undefined si está vacío
      provinciaResidenciaId: formValue.paisResidenciaId === 'ECUADOR'
        ? (formValue.provinciaResidenciaId || undefined)
        : undefined,
      cantonResidenciaId: formValue.paisResidenciaId === 'ECUADOR'
        ? (formValue.cantonResidenciaId || 'NA')
        : 'NA',
      
      // Campos académicos - convertir a enum si es necesario
      tipoColegioId: formValue.tipoColegioId || '',
      modalidadCarrera: formValue.modalidadCarrera || '',
      jornadaCarrera: formValue.jornadaCarrera || '',
      fechaInicioCarrera: formValue.fechaInicioCarrera || '',
      fechaMatricula: formValue.fechaMatricula || '',
      tipoMatricula: formValue.tipoMatriculaId || '',
      duracionPeriodoAcademico: this.parseNumber(formValue.duracionPeriodoAcademico, 1),
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
      direccionDomicilio: formValue.direccionDomicilio || 'NA',
      correoInstitucional: formValue.correoInstitucional || 'NA',
      lugarResidencia: formValue.lugarResidencia || 'NA',
      carrera: formValue.carrera || 'NA',
      disenoCurricular: formValue.disenoCurricular || 'NA',
      periodoAcademico: formValue.periodoAcademico || 'NA',
      alergias: formValue.alergias || 'NA',
      medicamentos: formValue.medicamentos || 'NA',
      referenciaPersonalNombre: formValue.referenciaPersonalNombre || 'NA',
      referenciaPersonalParentesco: formValue.referenciaPersonalParentesco || 'NA',
      referenciaPersonalTelefono: formValue.referenciaPersonalTelefono || 'NA',
      enfermedadCatastrofica: formValue.enfermedadCatastrofica || 'NA',

      // Campos de hogar
      nivelFormacionPadre: formValue.nivelFormacionPadre || '',
      nivelFormacionMadre: formValue.nivelFormacionMadre || '',
      ingresoTotalHogar: formValue.ingresoTotalHogar || 'NA',
      cantidadMiembrosHogar: this.parseInt(formValue.cantidadMiembrosHogar, 1),

      numeroConvencional: formValue.numeroConvencional || 'NA',
      presentaCarnetDiscapacidad: formValue.presentaCarnetDiscapacidad || 'NA',
      presentaAlergiaImportante: formValue.presentaAlergiaImportante || 'NA',
      nombreColegioProcedencia: formValue.nombreColegioProcedencia || 'NA',
      tituloBachiller: formValue.tituloBachiller || 'NA',
      anioGraduacion: formValue.anioGraduacion || 'NA',
      financiamientoQuienes: formValue.financiamientoQuienes || 'NA',
      referenciaDomiciliaria: formValue.referenciaDomiciliaria || 'NA',
      parroquiaResidencia: formValue.parroquiaResidencia || 'NA',
      barrioSector: formValue.barrioSector || 'NA',
      zonaVivienda: formValue.zonaVivienda || 'NA',
      coordenadasVivienda: formValue.coordenadasVivienda || 'NA',
      croquisViviendaUrl: formValue.croquisViviendaUrl || 'NA',
      tipoPropiedadVivienda: formValue.tipoPropiedadVivienda || 'NA',
      estructuraVivienda: formValue.estructuraVivienda === 'OTRO'
        ? ('OTRO: ' + (formValue.estructuraViviendaEspecifique || '').trim()).trim() || 'OTRO'
        : (formValue.estructuraVivienda || 'NA'),
      tipoVivienda: formValue.tipoVivienda || 'NA',
      serviciosDisponibles: formValue.serviciosDisponibles || 'NA',
      cantidadBanos: formValue.cantidadBanos != null && formValue.cantidadBanos !== '' ? this.parseInt(formValue.cantidadBanos, 0) : undefined,
      cantidadHabitaciones: formValue.cantidadHabitaciones != null && formValue.cantidadHabitaciones !== '' ? this.parseInt(formValue.cantidadHabitaciones, 0) : undefined,
      comparteHabitacion: formValue.comparteHabitacion || 'NA',
      conQuienVive: formValue.conQuienVive || 'NA',
      tamanoViviendaSuficiente: formValue.tamanoViviendaSuficiente || 'NA',
      dinamicaFamiliar: formValue.dinamicaFamiliar || 'NA',
      violenciaFamiliar: formValue.violenciaFamiliar || 'NA',
      tipoViolenciaFamiliar: formValue.tipoViolenciaFamiliar || 'NA',
      estudianteCabezaFamiliar: formValue.estudianteCabezaFamiliar || 'NA',
      familiaDiscapacidadEnfermedadCatastrofica: formValue.familiaDiscapacidadEnfermedadCatastrofica || 'NA',
      familiaProblemaSalud: formValue.familiaProblemaSalud || 'NA',
      familiaParentesco: formValue.familiaParentesco || 'NA',
      familiaServiciosMedicos: formValue.familiaServiciosMedicos || 'NA',
      familiaServiciosMedicosDetalle: this.buildFamiliaServiciosMedicosDetalle(formValue),
      egresoVivienda: this.toNumOrNAString(formValue.egresoVivienda),
      egresoAlimentacion: this.toNumOrNAString(formValue.egresoAlimentacion),
      egresoEducacion: this.toNumOrNAString(formValue.egresoEducacion),
      egresoIndumentaria: this.toNumOrNAString(formValue.egresoIndumentaria),
      egresoTransporte: this.toNumOrNAString(formValue.egresoTransporte),
      egresoSalud: this.toNumOrNAString(formValue.egresoSalud),
      egresoServiciosBasicos: this.toNumOrNAString(formValue.egresoServiciosBasicos),
      egresoOtros: this.toNumOrNAString(formValue.egresoOtros),
      totalEgresos: this.toNumOrNAString(formValue.totalEgresos),

      composicionFamiliar: (this.studentForm.get('composicionFamiliar') as FormArray).value
        .map((r: any) => ({
          nombresApellidos: r.nombresApellidos || 'NA',
          fechaNacimiento: r.fechaNacimiento || 'NA',
          cedulaIdentidad: r.cedulaIdentidad || 'NA',
          estadoCivil: r.estadoCivil || 'NA',
          parentesco: r.parentesco || 'NA',
          nivelEstudios: r.nivelEstudios || 'NA',
          titulo: r.titulo || 'NA',
          laborOcupacion: r.laborOcupacion || 'NA',
        }))
        .filter((r: any) => r.nombresApellidos !== 'NA' || r.cedulaIdentidad !== 'NA' || r.parentesco !== 'NA'),

      ingresosFamiliares: (this.studentForm.get('ingresosFamiliares') as FormArray).value
        .map((r: any) => ({
          nombresApellidos: r.nombresApellidos || 'NA',
          parentesco: r.parentesco || 'NA',
          actividadLaboral: r.actividadLaboral || 'NA',
          ingresoMensual: this.toNumOrNAString(r.ingresoMensual),
          ingresosExtras: this.toNumOrNAString(r.ingresosExtras),
          total: this.toNumOrNAString(r.total),
        }))
        .filter((r: any) => r.nombresApellidos !== 'NA' || r.ingresoMensual !== 'NA' || r.total !== 'NA'),
    };
    
    // Campos opcionales - solo agregar si tienen valor
    if (formValue.financiamientoBeca) {
      data.financiamientoBeca = formValue.financiamientoBeca;
    }
    if (formValue.tipoAlcanceProyectoVinculacionId) {
      data.tipoAlcanceProyectoVinculacion = formValue.tipoAlcanceProyectoVinculacionId;
    }
    
    // Eliminar provinciaNacimientoId si es undefined (cuando país no es Ecuador o cuando país es Ecuador pero no se seleccionó provincia)
    // Las provincias son opcionales (Provincia?) en el schema, así que undefined se guardará como null en la DB
    if (data.provinciaNacimientoId === undefined || data.provinciaNacimientoId === '' || data.provinciaNacimientoId === 'NA') {
      delete data.provinciaNacimientoId;
    }

    // Eliminar provinciaResidenciaId si es undefined (cuando país no es Ecuador o cuando país es Ecuador pero no se seleccionó provincia)
    // Las provincias son opcionales (Provincia?) en el schema, así que undefined se guardará como null en la DB
    if (data.provinciaResidenciaId === undefined || data.provinciaResidenciaId === '' || data.provinciaResidenciaId === 'NA') {
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
      'nivelFormacionPadre', 'nivelFormacionMadre', 'ingresoTotalHogar', 'cantidadMiembrosHogar',
    ];

    // Verificar campos requeridos que están vacíos
    const emptyRequiredFields = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (emptyRequiredFields.length > 0) {
      console.warn('Campos requeridos vacíos:', emptyRequiredFields);
    }

    // Asegurar que los valores numéricos sean realmente números (no strings)
    // Manejar valores "NA" o strings inválidos
    if (data.duracionPeriodoAcademico !== undefined && data.duracionPeriodoAcademico !== null) {
      const strValue = String(data.duracionPeriodoAcademico).trim().toUpperCase();
      if (strValue === 'NA' || strValue === '' || strValue === 'NULL') {
        data.duracionPeriodoAcademico = 1;
      } else {
        data.duracionPeriodoAcademico = Number(data.duracionPeriodoAcademico);
        if (isNaN(data.duracionPeriodoAcademico) || data.duracionPeriodoAcademico < 1) {
          data.duracionPeriodoAcademico = 1;
        }
      }
    } else {
      data.duracionPeriodoAcademico = 1;
    }
    
    if (data.cantidadMiembrosHogar !== undefined && data.cantidadMiembrosHogar !== null) {
      const strValue = String(data.cantidadMiembrosHogar).trim().toUpperCase();
      if (strValue === 'NA' || strValue === '' || strValue === 'NULL') {
        data.cantidadMiembrosHogar = 1;
      } else {
        data.cantidadMiembrosHogar = Math.floor(Number(data.cantidadMiembrosHogar));
        if (isNaN(data.cantidadMiembrosHogar) || data.cantidadMiembrosHogar < 1) {
          data.cantidadMiembrosHogar = 1;
        }
      }
    } else {
      data.cantidadMiembrosHogar = 1;
    }

    // Log para verificar tipos antes de enviar
    console.log('Tipos de datos numéricos:', {
      duracionPeriodoAcademico: {
        value: data.duracionPeriodoAcademico,
        type: typeof data.duracionPeriodoAcademico,
        isNumber: typeof data.duracionPeriodoAcademico === 'number'
      },
      cantidadMiembrosHogar: {
        value: data.cantidadMiembrosHogar,
        type: typeof data.cantidadMiembrosHogar,
        isNumber: typeof data.cantidadMiembrosHogar === 'number'
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

    const errors = control.errors;
    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (errors['integer'] || errors['integer1Range']) {
      return 'Debe ser un número entero válido';
    }
    if (errors['integer2Range']) {
      return 'Debe ser un número entero de 2 dígitos (1-99)';
    }
    if (errors['integer3Range']) {
      return 'Debe ser un número entero de 3 dígitos (0-999)';
    }
    if (errors['integer4Range']) {
      return 'Debe ser un número entero de 4 dígitos (0-9999)';
    }
    if (errors['integer5Range']) {
      return 'Debe ser un número entero de 5 dígitos (0-99999)';
    }
    if (errors['emailFormat']) {
      return 'Formato de correo electrónico inválido';
    }
    if (errors['numeric']) {
      return 'Debe contener solo números';
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['uppercase']) {
      return 'Debe estar en MAYÚSCULAS';
    }
    if (errors['cedulaFormat']) {
      return 'La cédula debe tener 10 dígitos numéricos';
    }
    if (errors['pasaporteFormat']) {
      return 'El pasaporte debe tener 9 caracteres alfanuméricos';
    }
    if (errors['dateFormat'] || errors['dateInvalid']) {
      return 'Formato de fecha inválido (yyyy-mm-dd)';
    }
    if (errors['length']) {
      return `Debe tener exactamente ${errors['length'].requiredLength} caracteres`;
    }
    if (errors['lettersOnly'] || errors['lettersOrNA']) {
      return 'Solo se permiten letras y espacios';
    }
    if (errors['numbersOnly'] || errors['numbersOrNA']) {
      return 'Solo se permiten números';
    }
    return 'Campo inválido';
  }

  hasError(controlName: string): boolean {
    const control = this.studentForm.get(controlName);
    return !!(control?.invalid && control?.touched);
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
      direccionDomicilio: 'Dirección Domicilio',
      correoInstitucional: 'Correo Institucional',
      lugarResidencia: 'Lugar Residencia',
      carrera: 'Carrera',
      disenoCurricular: 'Diseño Curricular',
      periodoAcademico: 'Período Académico',
      alergias: 'Alergias',
      medicamentos: 'Medicamentos',
      referenciaPersonalNombre: 'Referencia Personal Nombre',
      referenciaPersonalParentesco: 'Referencia Personal Parentesco',
      referenciaPersonalTelefono: 'Referencia Personal Teléfono',
      enfermedadCatastrofica: 'Enfermedad Catastrófica',
      nivelFormacionPadre: 'Nivel Formación Padre',
      nivelFormacionMadre: 'Nivel Formación Madre',
      ingresoTotalHogar: 'Ingreso Total Hogar',
      cantidadMiembrosHogar: 'Cantidad Miembros Hogar',
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
    if (!this.validateCurrentStep()) {
      this.scrollToFirstError();
      return;
    }
    if (this.currentStep >= this.totalSteps - 1) return;

    // En el primer paso: si solo hay tipo + número de identificación y no hay datos personales, buscar por cédula antes de guardar
    if (this.currentStep === 0) {
      const tipo = (this.studentForm.get('tipoDocumentoId')?.value ?? '').toString().trim();
      const num = (this.studentForm.get('numeroIdentificacion')?.value ?? '').toString().trim();
      const primerApellido = (this.studentForm.get('primerApellido')?.value ?? '').toString().trim();
      if (tipo && num && !primerApellido) {
        this.isSearchingByCedula = true;
        this.cedulaSearchMessage = 'Buscando datos...';
        this.cdr.detectChanges();
        this.estudianteService.getEstudianteByCedula(tipo, num).subscribe({
          next: (estudiante: any) => {
            this.isSearchingByCedula = false;
            this.cedulaSearchMessage = '';
            this.patchFormFromEstudiante(estudiante);
            this.cdr.detectChanges();
            this.doGuardarPasoYAvanzar();
          },
          error: (err: any) => {
            this.isSearchingByCedula = false;
            this.cedulaSearchMessage = '';
            this.cdr.detectChanges();
            if (err?.status === 404) {
              this.submitError = true;
              this.submitMessage = 'No hay registro con esta cédula. Complete todos los campos del formulario para registrarse.';
              this.cdr.detectChanges();
              setTimeout(() => {
                this.submitMessage = '';
                this.submitError = false;
                this.cdr.detectChanges();
              }, 5000);
              return;
            }
            this.submitError = true;
            this.submitMessage = err?.error?.message || err?.message || 'Error al buscar.';
            this.cdr.detectChanges();
            return;
          },
        });
        return;
      }
    }

    this.doGuardarPasoYAvanzar();
  }

  /** Guarda el paso actual en el backend y avanza al siguiente. */
  private doGuardarPasoYAvanzar(): void {
    this.isSubmitting = true;
    this.submitMessage = '';
    this.submitError = false;
    const formData = this.getFormDataForBackend();
    this.estudianteService
      .guardarPaso(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.currentStep++;
          this.submitError = false;
          this.submitMessage = 'Paso guardado correctamente.';
          this.saveFormData();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.cdr.detectChanges();
          setTimeout(() => {
            this.submitMessage = '';
            this.cdr.detectChanges();
          }, 2500);
        },
        error: (err: any) => {
          this.submitError = true;
          this.submitMessage = err?.error?.message || err?.message || 'Error al guardar el paso. Intenta de nuevo.';
          if (Array.isArray(err?.error?.message)) {
            this.submitMessage = 'Error de validación:\n' + err.error.message.join('\n');
          }
          this.cdr.detectChanges();
        },
      });
  }

  /** Rellena el formulario con los datos de un estudiante devuelto por el API (evita duplicar lógica de buscarPorCedula). */
  private patchFormFromEstudiante(estudiante: any): void {
    const formValue = this.apiEstudianteToFormValue(estudiante);
    this.studentForm.patchValue(formValue, { emitEvent: false });
    const compArr = this.studentForm.get('composicionFamiliar') as FormArray;
    compArr.clear();
    (estudiante.composicionFamiliar || []).forEach((r: any) => {
      compArr.push(this.createComposicionFamiliarGroup());
      const last = compArr.at(compArr.length - 1);
      last.patchValue({
        nombresApellidos: r.nombresApellidos ?? '',
        fechaNacimiento: r.fechaNacimiento ?? '',
        cedulaIdentidad: r.cedulaIdentidad ?? '',
        estadoCivil: r.estadoCivil ?? '',
        parentesco: r.parentesco ?? '',
        nivelEstudios: r.nivelEstudios ?? '',
        titulo: r.titulo ?? '',
        laborOcupacion: r.laborOcupacion ?? '',
      }, { emitEvent: false });
    });
    const ingArr = this.studentForm.get('ingresosFamiliares') as FormArray;
    ingArr.clear();
    (estudiante.ingresosFamiliares || []).forEach((r: any) => {
      ingArr.push(this.createIngresoFamiliarGroup());
      const row = ingArr.at(ingArr.length - 1) as FormGroup;
      const ing = Number(r.ingresoMensual) || 0;
      const ext = Number(r.ingresosExtras) || 0;
      row.patchValue({
        nombresApellidos: r.nombresApellidos ?? '',
        parentesco: r.parentesco ?? '',
        actividadLaboral: r.actividadLaboral ?? '',
        ingresoMensual: r.ingresoMensual ?? '',
        ingresosExtras: r.ingresosExtras ?? '',
        total: ((ing + ext) || r.total) ?? '',
      }, { emitEvent: false });
      row.get('ingresoMensual')?.valueChanges.subscribe(() => this.updateIngresoTotalRow(row));
      row.get('ingresosExtras')?.valueChanges.subscribe(() => this.updateIngresoTotalRow(row));
    });
    this.updateTotalEgresos();
    if (this.studentForm.get('familiaDiscapacidadEnfermedadCatastrofica')?.value === 'SI') {
      this.studentForm.get('familiaProblemaSalud')?.updateValueAndValidity({ emitEvent: false });
      this.studentForm.get('familiaParentesco')?.updateValueAndValidity({ emitEvent: false });
    }
    this.paisNacionalidadSearch = this.getEnumLabel(formValue['paisNacionalidadId'] as string) || '';
    this.paisResidenciaSearch = this.getEnumLabel(formValue['paisResidenciaId'] as string) || '';
    this.provinciaNacimientoSearch = this.getEnumLabel(formValue['provinciaNacimientoId'] as string) || '';
    this.provinciaResidenciaSearch = this.getEnumLabel(formValue['provinciaResidenciaId'] as string) || '';
    this.cantonNacimientoSearch = this.getEnumLabel(formValue['cantonNacimientoId'] as string) || '';
    this.cantonResidenciaSearch = this.getEnumLabel(formValue['cantonResidenciaId'] as string) || '';
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
      // Guardar el paso actual
      this.saveFormData();
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
        // Guardar el paso actual
        this.saveFormData();
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

}
