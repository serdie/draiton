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
  MapPin,
  ArrowRight,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  ArrowRight as ChevronRightIcon,
  Grid3X3,
  List,
  Heart,
  Share2,
  Download,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  views: number;
  likes: number;
  date: string;
  readTime: number;
  featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'guide' | 'tutorial' | 'faq' | 'video';
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const categories: Category[] = [
  {
    id: 'getting-started',
    name: 'Primeros Pasos',
    description: 'Guías para comenzar con Draiton',
    icon: <Zap className="h-5 w-5" />,
    count: 12,
    color: 'bg-blue-500'
  },
  {
    id: 'billing',
    name: 'Facturación',
    description: 'Verifactu, facturas y pagos',
    icon: <CreditCard className="h-5 w-5" />,
    count: 8,
    color: 'bg-green-500'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'IA para marketing y redes sociales',
    icon: <BarChart3 className="h-5 w-5" />,
    count: 15,
    color: 'bg-purple-500'
  },
  {
    id: 'hr',
    name: 'Recursos Humanos',
    description: 'Empleados, nóminas y control horario',
    icon: <Users className="h-5 w-5" />,
    count: 10,
    color: 'bg-orange-500'
  },
  {
    id: 'security',
    name: 'Seguridad',
    description: 'Privacidad y protección de datos',
    icon: <Shield className="h-5 w-5" />,
    count: 6,
    color: 'bg-red-500'
  },
  {
    id: 'integrations',
    name: 'Integraciones',
    description: 'Conexiones con otras herramientas',
    icon: <LifeBuoy className="h-5 w-5" />,
    count: 9,
    color: 'bg-indigo-500'
  }
];

const articles: Article[] = [
  {
    id: '1',
    title: 'Cómo crear tu primera factura electrónica con Verifactu',
    description: 'Guía paso a paso para emitir tus primeras facturas electrónicas cumpliendo con la normativa Verifactu.',
    category: 'billing',
    subcategory: 'facturacion',
    tags: ['facturacion', 'verifactu', 'comienzo'],
    views: 1245,
    likes: 89,
    date: '2025-01-15',
    readTime: 5,
    featured: true,
    difficulty: 'beginner',
    type: 'tutorial'
  },
  {
    id: '2',
    title: 'Configurar el control horario para empleados',
    description: 'Aprende a configurar el sistema de fichaje para tus empleados y gestionar sus horarios.',
    category: 'hr',
    subcategory: 'control-horario',
    tags: ['empleados', 'fichaje', 'horario'],
    views: 987,
    likes: 67,
    date: '2025-01-12',
    readTime: 7,
    featured: true,
    difficulty: 'beginner',
    type: 'guide'
  },
  {
    id: '3',
    title: 'Generar nóminas con IA para tu equipo',
    description: 'Descubre cómo crear nóminas profesionales para tus empleados usando nuestras herramientas de IA.',
    category: 'hr',
    subcategory: 'nomina',
    tags: ['nominas', 'ia', 'empleados'],
    views: 1423,
    likes: 102,
    date: '2025-01-10',
    readTime: 8,
    featured: true,
    difficulty: 'intermediate',
    type: 'tutorial'
  },
  {
    id: '4',
    title: 'Crear contenido para redes sociales con IA',
    description: 'Aprende a generar contenido atractivo para tus redes sociales usando la IA de Draiton.',
    category: 'marketing',
    subcategory: 'contenido',
    tags: ['marketing', 'ia', 'redes-sociales'],
    views: 2156,
    likes: 145,
    date: '2025-01-08',
    readTime: 6,
    featured: true,
    difficulty: 'intermediate',
    type: 'guide'
  },
  {
    id: '5',
    title: 'Conectar tu tienda online con Draiton',
    description: 'Guía para integrar tu tienda online y automatizar la gestión de pedidos y facturación.',
    category: 'integrations',
    subcategory: 'ecommerce',
    tags: ['conexion', 'tienda', 'automatizacion'],
    views: 789,
    likes: 54,
    date: '2025-01-05',
    readTime: 10,
    featured: false,
    difficulty: 'advanced',
    type: 'tutorial'
  },
  {
    id: '6',
    title: 'Proteger tus datos en Draiton',
    description: 'Medidas de seguridad y privacidad que implementamos para proteger tu información.',
    category: 'security',
    subcategory: 'privacidad',
    tags: ['seguridad', 'privacidad', 'datos'],
    views: 1567,
    likes: 98,
    date: '2025-01-03',
    readTime: 4,
    featured: false,
    difficulty: 'beginner',
    type: 'guide'
  },
  {
    id: '7',
    title: 'Importar clientes desde otros sistemas',
    description: 'Cómo migrar tus clientes existentes a Draiton de forma rápida y segura.',
    category: 'getting-started',
    subcategory: 'migracion',
    tags: ['clientes', 'migracion', 'importar'],
    views: 876,
    likes: 63,
    date: '2025-01-01',
    readTime: 5,
    featured: false,
    difficulty: 'intermediate',
    type: 'tutorial'
  },
  {
    id: '8',
    title: 'Configurar alertas de impuestos',
    description: 'Aprende a configurar alertas para que nunca te olvides de presentar tus impuestos.',
    category: 'billing',
    subcategory: 'impuestos',
    tags: ['impuestos', 'alertas', 'cumplimiento'],
    views: 1342,
    likes: 87,
    date: '2024-12-28',
    readTime: 6,
    featured: false,
    difficulty: 'intermediate',
    type: 'guide'
  }
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

export function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [popularSearchesState, setPopularSearchesState] = useState(popularSearches);

  useEffect(() => {
    let results = articles;
    
    if (searchTerm) {
      results = results.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      results = results.filter(article => article.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'all') {
      results = results.filter(article => article.difficulty === selectedDifficulty);
    }
    
    if (selectedType !== 'all') {
      results = results.filter(article => article.type === selectedType);
    }
    
    setFilteredArticles(results);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedType]);

  const featuredArticles = articles.filter(article => article.featured);
  const recentArticles = articles.slice(0, 4);

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
            {popularSearchesState.slice(0, 6).map((topic, index) => (
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
                Filtrar
              </CardTitle>
              <CardDescription>
                Refina tu búsqueda por categoría o tipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-medium mb-3">Categorías</h3>
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
                      <span>Todos</span>
                    </div>
                    <span className="text-sm">{articles.length}</span>
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="font-medium mb-3">Dificultad</h3>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div>
                <h3 className="font-medium mb-3">Tipo</h3>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="guide">Guía</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Featured Articles */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Artículos Destacados
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-background to-muted">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(cat => cat.id === article.category)?.name}
                      </Badge>
                      {article.type === 'video' && (
                        <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{article.readTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{Math.floor(article.views / 100) * 100}+</span>
                        </div>
                      </div>
                      <span className="text-xs">{article.date}</span>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Articles */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Artículos Recientes
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium mb-2">No se encontraron artículos</h3>
                <p className="text-muted-foreground mb-6">
                  No hay artículos que coincidan con tus filtros actuales.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                    setSelectedType('all');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                  : 'space-y-4'
              }>
                {filteredArticles.map((article) => (
                  <Card 
                    key={article.id} 
                    className={`group hover:shadow-lg transition-all duration-200 overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {viewMode === 'list' ? (
                      <>
                        <div className="w-32 h-20 bg-muted flex items-center justify-center rounded-l-lg flex-shrink-0">
                          {article.type === 'video' ? (
                            <Play className="h-6 w-6 text-primary" />
                          ) : (
                            <FileText className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(cat => cat.id === article.category)?.name}
                            </Badge>
                            {article.type === 'video' && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs ml-2">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span>{article.readTime} min</span>
                              <span>{article.likes} me gusta</span>
                              <span>{Math.floor(article.views / 100) * 100}+ vistas</span>
                            </div>
                            <span>{article.date}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {categories.find(cat => cat.id === article.category)?.name}
                          </Badge>
                          {article.type === 'video' && (
                            <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold group-hover:text-primary transition-colors mb-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {article.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{article.readTime} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <span>{article.date}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Preguntas Frecuentes
              </h2>
              <a
                href="/preguntas-frecuentes"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Más preguntas frecuentes
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
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
                Chatea con nuestro sistema de IA en tiempo real para resolver tus dudas instantáneamente.
              </p>
              <Button variant="outline" className="mx-auto w-fit" asChild>
                <a href="/soporte">
                  Iniciar Chat con IA
                </a>
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
              <Button variant="outline" className="mx-auto w-fit" asChild>
                <a href="/tutoriales-video">
                  Ver Videos
                </a>
              </Button>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <LifeBuoy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sistema de Tickets</h3>
              <p className="text-muted-foreground mb-4">
                Nuestro sistema de tickets es la forma más efectiva de resolver tus dudas.
                Recibirás respuestas rápidas y precisas de nuestro equipo.
              </p>
              <Button variant="outline" className="mx-auto w-fit" asChild>
                <a href="/soporte">
                  Abrir Ticket
                </a>
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
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 gap-2" asChild>
                <a href="/soporte">
                  <MessageSquare className="h-5 w-5" />
                  Ir a Soporte
                </a>
              </Button>
              <Button size="lg" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 gap-2" asChild>
                <a href="/soporte">
                  <LifeBuoy className="h-5 w-5" />
                  Abrir Ticket
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}