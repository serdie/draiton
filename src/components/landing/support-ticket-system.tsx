'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  LifeBuoy,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock,
  Upload,
  X,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  imageUrl?: string;
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

export function SupportTicketSystem() {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'crear' | 'ver'>('crear');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'media' as const
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. El tamaño máximo es de 5MB.');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

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
          imageUrl: data.imageUrl || null,
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
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const storage = getStorage();
        const timestamp = typeof window !== 'undefined' ? Date.now() : new Date().getTime();
        const storageRef = ref(storage, `support-tickets/${user.uid}/${timestamp}_${selectedImage.name}`);

        await uploadBytes(storageRef, selectedImage);
        imageUrl = await getDownloadURL(storageRef);
      }

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
        imageUrl: imageUrl || null,
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
      setSelectedImage(null);
      setImagePreview(null);

      setActiveTab('ver');

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

  // Mostrar mensaje mientras se cargan los tickets
  if (loading || isLoading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando sistema de soporte...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Centro de Soporte
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Sistema de tickets para resolver tus dudas y problemas. Crea un nuevo ticket o revisa el estado de tus solicitudes existentes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className={`shadow-lg ${!isAuthenticated ? 'opacity-60 pointer-events-none' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5" />
                Sistema de Tickets
              </CardTitle>
              <CardDescription>
                Gestiona tus solicitudes de soporte de manera eficiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex border-b mb-6">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'crear'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => isAuthenticated ? setActiveTab('crear') : alert('Debes iniciar sesión para crear tickets')}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Crear Ticket
                  </div>
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'ver'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => isAuthenticated ? setActiveTab('ver') : alert('Debes iniciar sesión para ver tickets')}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Ver Tickets
                  </div>
                </button>
              </div>

              {activeTab === 'crear' ? (
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Tu Correo Electrónico *</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                          {priorities.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
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

                    {/* Image Upload Section */}
                    <div>
                      <Label htmlFor="image-upload">Adjuntar Imagen (Opcional)</Label>
                      <div className="mt-2 flex flex-col gap-2">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Vista previa de la imagen adjunta"
                              className="max-h-40 rounded-md object-contain border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-1"
                              onClick={removeImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="image-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-muted hover:border-primary transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground text-center">
                                  <span className="font-semibold">Haz clic para subir</span> o arrastra una imagen aquí
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF hasta 5MB</p>
                              </div>
                              <input
                                id="image-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={!isAuthenticated}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={!isAuthenticated}
                  >
                    <Send className="h-4 w-4" />
                    Enviar Ticket
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        disabled={!isAuthenticated}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                        disabled={!isAuthenticated}
                      >
                        <SelectTrigger className="w-[140px]">
                          <Filter className="h-4 w-4 mr-2" />
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
                      <Select
                        value={filterPriority}
                        onValueChange={setFilterPriority}
                        disabled={!isAuthenticated}
                      >
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
                    </div>
                  </div>

                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No tienes tickets</h3>
                      <p className="mt-2 text-muted-foreground">
                        {searchTerm ? 'No hay tickets que coincidan con tu búsqueda.' : 'Aún no has creado ningún ticket.'}
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => isAuthenticated ? setActiveTab('crear') : alert('Debes iniciar sesión para crear tickets')}
                        variant="outline"
                      >
                        Crear un nuevo ticket
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                          <div
                            className="p-4 bg-background cursor-pointer flex justify-between items-center"
                            onClick={() => toggleTicket(ticket.id)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium truncate">{ticket.subject}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.id}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {ticket.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {ticket.user}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Badge className={statuses.find(s => s.value === ticket.status)?.color}>
                                {statuses.find(s => s.value === ticket.status)?.label}
                              </Badge>
                              <Badge className={priorities.find(p => p.value === ticket.priority)?.color}>
                                {priorities.find(p => p.value === ticket.priority)?.label}
                              </Badge>
                              {expandedTicket === ticket.id ? (
                                <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {expandedTicket === ticket.id && (
                            <div className="p-4 pt-0 border-t bg-muted/10">
                              <div className="text-sm text-muted-foreground mb-3">
                                <p className="font-medium mb-1">Categoría:</p>
                                <p>{categories.find(c => c.value === ticket.category)?.label}</p>
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                <p className="font-medium mb-1">Descripción:</p>
                                <p>{ticket.description}</p>
                              </div>
                              {ticket.imageUrl && (
                                <div className="mb-3">
                                  <p className="font-medium mb-1">Imagen adjunta:</p>
                                  <a
                                    href={ticket.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={ticket.imageUrl}
                                      alt="Imagen adjunta al ticket"
                                      className="max-h-40 rounded-md object-contain border hover:opacity-90 transition-opacity"
                                    />
                                  </a>
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                <p className="font-medium mb-1">Correo de contacto:</p>
                                <p>{ticket.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="space-y-6">
            <Card className={`shadow-lg ${!isAuthenticated ? 'opacity-60 pointer-events-none' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  ¿Cómo funciona?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                      <span className="text-primary font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Crea un ticket</h4>
                      <p className="text-sm text-muted-foreground">Describe tu problema o pregunta en detalle</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                      <span className="text-primary font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Recibe confirmación</h4>
                      <p className="text-sm text-muted-foreground">Te enviaremos un correo con el ID de tu ticket</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                      <span className="text-primary font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Seguimiento</h4>
                      <p className="text-sm text-muted-foreground">Consulta el estado de tu ticket en cualquier momento</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                      <span className="text-primary font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Resolución</h4>
                      <p className="text-sm text-muted-foreground">Recibirás una solución a tu problema</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className={`shadow-lg ${!isAuthenticated ? 'opacity-60 pointer-events-none' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tickets totales</span>
                    <span className="font-medium">{tickets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tickets abiertos</span>
                    <span className="font-medium">{tickets.filter(t => t.status === 'abierto').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tickets resueltos</span>
                    <span className="font-medium">{tickets.filter(t => t.status === 'resuelto').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tiempo promedio</span>
                    <span className="font-medium">24-48 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`shadow-lg ${!isAuthenticated ? 'opacity-60 pointer-events-none' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prioridades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Baja: 5-7 días hábiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Media: 2-3 días hábiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Alta: 24-48 horas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Urgente: 2-4 horas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="relative mb-8 mt-8">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl z-10"></div>
          <div className="relative z-20 text-center py-12 px-4">
            <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Regístrate para acceder al sistema de tickets</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              El sistema completo de tickets está disponible para usuarios registrados.
              Únete a Draiton para resolver tus dudas y problemas de manera eficiente.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild>
                <a href="/login">Iniciar Sesión</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/seleccionar-plan">Registrarse</a>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-12 text-center ${!isAuthenticated ? 'opacity-60 pointer-events-none' : ''}`}>
        <h2 className="text-2xl font-bold mb-4">¿Necesitas ayuda inmediata?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Para asuntos urgentes, puedes contactarnos directamente. Nuestro equipo está listo para ayudarte.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <a href="mailto:soporte@draiton.es">
              <Mail className="h-5 w-5" />
              Enviar Email
            </a>
          </Button>
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <a href="/tutoriales-video">
              <Video className="h-5 w-5" />
              Tutoriales en Video
            </a>
          </Button>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <a href="/centro-de-ayuda">
              <LifeBuoy className="h-5 w-5" />
              Centro de Ayuda
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}