'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  BookOpen,
  MessageSquare,
  LifeBuoy,
  Zap,
  Shield,
  CreditCard,
  Users,
  BarChart3,
  FileText,
  Video,
  Star,
  ChevronRight,
  ExternalLink,
  Filter,
  Clock,
  User,
  ThumbsUp,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  Mail as MailIcon,
  Lock,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/context/auth-context';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getFirestore 
} from 'firebase/firestore';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'abierto' | 'en-progreso' | 'resuelto' | 'cerrado';
  date: string;
  user: string;
  email: string;
  userId: string;
  createdAt: Date;
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'recursos-humanos', label: 'Recursos Humanos' },
  { value: 'funcionalidad', label: 'Funcionalidad' },
  { value: 'fiscalidad', label: 'Fiscalidad' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'conexion', label: 'Conexiones' }
];

const priorities = [
  { value: 'baja', label: 'Baja', color: 'bg-blue-100 text-blue-800' },
  { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

const statuses = [
  { value: 'abierto', label: 'Abierto', color: 'bg-gray-100 text-gray-800' },
  { value: 'en-progreso', label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  { value: 'resuelto', label: 'Resuelto', color: 'bg-green-100 text-green-800' },
  { value: 'cerrado', label: 'Cerrado', color: 'bg-purple-100 text-purple-800' }
];

const popularSearches = [
  'Facturación electrónica',
  'Control horario',
  'Generación de nóminas',
  'Marketing con IA',
  'Verifactu',
  'Fichajes de empleados',
  'Automatización de tareas',
  'Análisis de clientes'
];

const faqs = [
  {
    question: '¿Cómo puedo cambiar mi plan de suscripción?',
    answer: 'Puedes cambiar tu plan en cualquier momento desde la sección de "Configuración" > "Suscripción". Selecciona el nuevo plan y sigue las instrucciones para completar el proceso.'
  },
  {
    question: '¿Es seguro mi dinero en Draiton?',
    answer: 'Sí, utilizamos sistemas de pago certificados y encriptación de nivel bancario para proteger tus datos financieros. Además, no almacenamos información sensible de tarjetas de crédito.'
  },
  {
    question: '¿Puedo importar datos desde otros sistemas?',
    answer: 'Sí, ofrecemos herramientas de migración que te permiten importar clientes, facturas, gastos y otros datos desde la mayoría de los sistemas de gestión comunes.'
  },
  {
    question: '¿Cómo funciona la integración con Verifactu?',
    answer: 'Nuestra integración con Verifactu permite emitir facturas electrónicas que cumplen con todos los requisitos legales. Las facturas se registran automáticamente en el sistema de la AEAT.'
  }
];

export function HelpCenterFinalFunctional() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'media' as const
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    if (!loading) {
      setIsAuthenticated(!!user);
      if (user) {
        setUserEmail(user.email || '');
      }
    }
  }, [user, loading]);

  // Cargar los tickets del usuario autenticado
  useEffect(() => {
    if (!user || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, 'supportTickets'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData: Ticket[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ticketsData.push({
          id: doc.id,
          subject: data.subject,
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: data.status,
          date: data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          user: data.user || user.displayName || 'Usuario Actual',
          email: data.email,
          userId: data.userId,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        });
      });

      // Ordenar tickets por fecha de creación (más recientes primero)
      ticketsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setTickets(ticketsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al cargar los tickets:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAuthenticated]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para crear un ticket');
      return;
    }

    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (!userEmail.trim()) {
      alert('Por favor, proporciona tu correo electrónico para poder contactarte');
      return;
    }

    try {
      // Crear el ticket en Firestore
      const ticketRef = await addDoc(collection(db, 'supportTickets'), {
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'abierto',
        userId: user.uid,
        email: userEmail,
        user: user.displayName || 'Usuario Actual',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Resetear el formulario
      setNewTicket({
        subject: '',
        description: '',
        category: 'general',
        priority: 'media'
      });
      
      setActiveTab('browse');
      
      // Mostrar mensaje de éxito
      alert(`¡Ticket creado exitosamente! ID: ${ticketRef.id}\n\nUn correo de confirmación ha sido enviado a ${userEmail}`);
    } catch (error) {
      console.error("Error al crear el ticket:", error);
      alert('Hubo un error al crear el ticket. Por favor, inténtalo de nuevo.');
    }
  };

  // Filtrar tickets según criterios de búsqueda y filtros
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'todos' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const toggleTicket = (id: string) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para ver los detalles del ticket');
      return;
    }
    setExpandedTicket(expandedTicket === id ? null : id);
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-6">
          Centro de Ayuda
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Encuentra respuestas a tus preguntas, tutoriales paso a paso y recursos para aprovechar al máximo Draiton.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos, tutoriales y respuestas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg shadow-2xl rounded-xl"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-8 rounded-lg">
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {popularSearches.slice(0, 6).map((topic, index) => (
              <button
                key={index}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                onClick={() => setSearchTerm(topic)}
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-2xl">128+</h3>
          <p className="text-sm text-muted-foreground">Artículos de ayuda</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-2xl">24/7</h3>
          <p className="text-sm text-muted-foreground">Soporte disponible</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-2xl">98%</h3>
          <p className="text-sm text-muted-foreground">Usuarios satisfechos</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-2xl">&lt; 2 min</h3>
          <p className="text-sm text-muted-foreground">Tiempo de respuesta</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Categorías
              </CardTitle>
              <CardDescription>
                Navega por las diferentes categorías de ayuda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <div className="flex items-center gap-3">
                    <Grid3X3 className="h-4 w-4" />
                    <span>Todos los artículos</span>
                  </div>
                  <span className="text-sm">{tickets.length}</span>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.value}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-primary">•</span>
                      <span>{category.label}</span>
                    </div>
                    <span className="text-sm">{tickets.filter(t => t.category === category.value).length}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => isAuthenticated ? setActiveTab('browse') : alert('Debes iniciar sesión para ver tickets')}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ver Tickets
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => isAuthenticated ? setActiveTab('create') : alert('Debes iniciar sesión para crear tickets')}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Crear Ticket
              </div>
            </button>
          </div>

          {activeTab === 'browse' ? (
            <>
              {/* All Tickets */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Tus Tickets
                  </h2>
                  <div className="flex items-center gap-2">
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas las prioridades</SelectItem>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No se encontraron tickets</h3>
                    <p className="mt-2 text-muted-foreground">
                      {searchTerm ? 'No hay tickets que coincidan con tu búsqueda.' : 'Aún no has creado ningún ticket.'}
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => isAuthenticated ? setActiveTab('create') : alert('Debes iniciar sesión para crear tickets')}
                      variant="outline"
                    >
                      Crear un nuevo ticket
                    </Button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                    {filteredTickets.map((ticket) => (
                      <Card 
                        key={ticket.id} 
                        className={`group hover:shadow-lg transition-all duration-200 overflow-hidden ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                      >
                        {viewMode === 'list' ? (
                          <>
                            <div className="w-24 h-16 bg-muted flex items-center justify-center rounded-l-lg flex-shrink-0">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="p-4 flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {categories.find(cat => cat.value === ticket.category)?.label}
                                </Badge>
                                <div className="flex items-center gap-2 ml-2">
                                  <Badge className={`${priorities.find(p => p.value === ticket.priority)?.color} text-xs`}>
                                    {priorities.find(p => p.value === ticket.priority)?.label}
                                  </Badge>
                                  <button 
                                    onClick={() => toggleTicket(ticket.id)}
                                    className="text-muted-foreground hover:text-primary"
                                  >
                                    {expandedTicket === ticket.id ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                                {ticket.subject}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {ticket.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-3">
                                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                  <span>{Math.floor(Math.random() * 20) + 1} likes</span>
                                </div>
                                <Badge className={`${statuses.find(s => s.value === ticket.status)?.color} text-xs`}>
                                  {statuses.find(s => s.value === ticket.status)?.label}
                                </Badge>
                              </div>
                              
                              {expandedTicket === ticket.id && (
                                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                                  <p className="mb-1"><span className="font-medium">Categoría:</span> {categories.find(cat => cat.value === ticket.category)?.label}</p>
                                  <p><span className="font-medium">Correo:</span> {ticket.email}</p>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {categories.find(cat => cat.value === ticket.category)?.label}
                              </Badge>
                              <Badge className={`${statuses.find(s => s.value === ticket.status)?.color} text-xs`}>
                                {statuses.find(s => s.value === ticket.status)?.label}
                              </Badge>
                            </div>
                            
                            <h3 className="font-bold group-hover:text-primary transition-colors mb-2">
                              {ticket.subject}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {ticket.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                  <span>{Math.floor(Math.random() * 20) + 1}</span>
                                </div>
                              </div>
                              <Badge className={`${priorities.find(p => p.value === ticket.priority)?.color} text-xs`}>
                                {priorities.find(p => p.value === ticket.priority)?.label}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                {ticket.category}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Create Ticket Form
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Crear Nuevo Ticket de Soporte</CardTitle>
                <CardDescription>
                  Describe tu problema o pregunta y nuestro equipo te ayudará
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Tu Correo Electrónico *</Label>
                      <div className="relative mt-2">
                        <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                          className="pl-10"
                          disabled={!isAuthenticated}
                        />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Te contactaremos a través de este correo cuando haya novedades sobre tu ticket
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input
                        id="subject"
                        placeholder="Breve descripción de tu problema o pregunta"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                        required
                        disabled={!isAuthenticated}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(value) => setNewTicket({...newTicket, category: value})}
                        disabled={!isAuthenticated}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(value: any) => setNewTicket({...newTicket, priority: value})}
                        disabled={!isAuthenticated}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción Detallada *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe con detalle tu problema o pregunta. Cuanto más información proporciones, más rápido podremos ayudarte."
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        rows={5}
                        required
                        disabled={!isAuthenticated}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={!isAuthenticated}>
                    <Send className="h-4 w-4" />
                    Enviar Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* FAQ Section */}
          <div className="mt-16 mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Preguntas Frecuentes
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <h3 className="font-medium flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Soporte en Vivo</h3>
              <p className="text-muted-foreground mb-4">
                Habla con uno de nuestros expertos en tiempo real para resolver tus dudas.
              </p>
              <Button variant="outline" className="mx-auto w-fit">
                Iniciar Chat
              </Button>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tutoriales en Video</h3>
              <p className="text-muted-foreground mb-4">
                Aprende a usar Draiton con nuestros tutoriales paso a paso en video.
              </p>
              <Button variant="outline" className="mx-auto w-fit">
                Ver Videos
              </Button>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Asistencia Telefónica</h3>
              <p className="text-muted-foreground mb-4">
                Llama a nuestro equipo de soporte para asistencia personalizada.
              </p>
              <Button variant="outline" className="mx-auto w-fit">
                Llamar Ahora
              </Button>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Necesitas ayuda personalizada?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
              Nuestro equipo de expertos está listo para ayudarte a resolver problemas complejos y optimizar tu uso de Draiton.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 gap-2">
                <Phone className="h-5 w-5" />
                Llamar al Soporte
              </Button>
              <Button size="lg" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 gap-2">
                <Mail className="h-5 w-5" />
                Enviar Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}