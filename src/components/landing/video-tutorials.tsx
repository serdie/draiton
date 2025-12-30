'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Play,
  Clock,
  Eye,
  ThumbsUp,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Video,
  Star,
  ChevronRight,
  ExternalLink,
  User,
  Zap,
  CreditCard,
  Shield,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  views: number;
  likes: number;
  date: string;
  duration: number; // in minutes
  thumbnail: string;
  videoUrl: string;
  youtubeId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
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
    description: 'Videos para comenzar con Draiton',
    icon: <Zap className="h-5 w-5" />,
    count: 8,
    color: 'bg-blue-500'
  },
  {
    id: 'billing',
    name: 'Facturación',
    description: 'Verifactu, facturas y pagos',
    icon: <CreditCard className="h-5 w-5" />,
    count: 6,
    color: 'bg-green-500'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'IA para marketing y redes sociales',
    icon: <BarChart3 className="h-5 w-5" />,
    count: 10,
    color: 'bg-purple-500'
  },
  {
    id: 'hr',
    name: 'Recursos Humanos',
    description: 'Empleados, nóminas y control horario',
    icon: <Users className="h-5 w-5" />,
    count: 7,
    color: 'bg-orange-500'
  },
  {
    id: 'security',
    name: 'Seguridad',
    description: 'Privacidad y protección de datos',
    icon: <Shield className="h-5 w-5" />,
    count: 4,
    color: 'bg-red-500'
  },
  {
    id: 'integrations',
    name: 'Integraciones',
    description: 'Conexiones con otras herramientas',
    icon: <BookOpen className="h-5 w-5" />,
    count: 5,
    color: 'bg-indigo-500'
  }
];

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Cómo crear tu primera factura electrónica con Verifactu',
    description: 'Aprende paso a paso cómo emitir tus primeras facturas electrónicas cumpliendo con la normativa Verifactu.',
    category: 'billing',
    subcategory: 'facturacion',
    tags: ['facturacion', 'verifactu', 'comienzo'],
    views: 1245,
    likes: 89,
    date: '2025-01-15',
    duration: 8,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'beginner'
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
    duration: 6,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'beginner'
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
    duration: 10,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'intermediate'
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
    duration: 7,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'intermediate'
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
    duration: 12,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'advanced'
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
    duration: 5,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'beginner'
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
    duration: 9,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'intermediate'
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
    duration: 6,
    thumbnail: 'https://img.youtube.com/vi/j7b-zFUlV_o/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=j7b-zFUlV_o',
    youtubeId: 'j7b-zFUlV_o',
    level: 'intermediate'
  }
];

export function VideoTutorials() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>(tutorials);
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);

  // Filter tutorials based on search term, category, and level
  useEffect(() => {
    let results = tutorials;

    if (searchTerm) {
      results = results.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      results = results.filter(tutorial => tutorial.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      results = results.filter(tutorial => tutorial.level === selectedLevel);
    }

    setFilteredTutorials(results);
  }, [searchTerm, selectedCategory, selectedLevel]);

  const featuredTutorials = tutorials.filter(tutorial =>
    ['1', '4', '3'].includes(tutorial.id) // Top 3 featured tutorials
  );

  const openVideoModal = (tutorial: Tutorial) => {
    setSelectedVideo(tutorial);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-6">
          Tutoriales en Video
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Aprende a utilizar Draiton con nuestros tutoriales en video paso a paso. 
          Desde conceptos básicos hasta funciones avanzadas.
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar tutoriales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg shadow-2xl rounded-xl"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-8 rounded-lg">
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-2xl">40+</h3>
          <p className="text-sm text-muted-foreground">Tutoriales en video</p>
        </Card>

        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-2xl">15k+</h3>
          <p className="text-sm text-muted-foreground">Visualizaciones</p>
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
          <h3 className="font-bold text-2xl">24/7</h3>
          <p className="text-sm text-muted-foreground">Acceso ilimitado</p>
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
                Refina tu búsqueda por categoría o nivel
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
                    <span className="text-sm">{tutorials.length}</span>
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

              {/* Level */}
              <div>
                <h3 className="font-medium mb-3">Nivel</h3>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Featured Tutorials */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Tutoriales Destacados
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-background to-muted">
                  <div
                    onClick={() => openVideoModal(tutorial)}
                    className="block relative cursor-pointer"
                  >
                    <img
                      src={tutorial.thumbnail}
                      alt={tutorial.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {tutorial.duration} min
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(cat => cat.id === tutorial.category)?.name}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{tutorial.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{tutorial.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{Math.floor(tutorial.views / 100) * 100}+</span>
                        </div>
                      </div>
                      <span className="text-xs">{tutorial.date}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {tutorial.tags.slice(0, 3).map((tag, index) => (
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

          {/* All Tutorials */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Video className="h-6 w-6" />
                Todos los Tutoriales
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

            {filteredTutorials.length === 0 ? (
              <div className="text-center py-16">
                <Video className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium mb-2">No se encontraron tutoriales</h3>
                <p className="text-muted-foreground mb-6">
                  No hay tutoriales que coincidan con tus filtros actuales.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
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
                {filteredTutorials.map((tutorial) => (
                  <Card
                    key={tutorial.id}
                    className={`group hover:shadow-lg transition-all duration-200 overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {viewMode === 'list' ? (
                      <>
                        <div
                          onClick={() => openVideoModal(tutorial)}
                          className="w-40 h-24 bg-muted flex-shrink-0 relative block cursor-pointer"
                        >
                          <img
                            src={tutorial.thumbnail}
                            alt={tutorial.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {tutorial.duration} min
                          </div>
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(cat => cat.id === tutorial.category)?.name}
                            </Badge>
                            <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs ml-2">
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          </div>
                          <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                            {tutorial.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {tutorial.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span>{tutorial.duration} min</span>
                              <span>{tutorial.likes} me gusta</span>
                              <span>{Math.floor(tutorial.views / 100) * 100}+ vistas</span>
                            </div>
                            <span>{tutorial.date}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          onClick={() => openVideoModal(tutorial)}
                          className="block relative cursor-pointer"
                        >
                          <img
                            src={tutorial.thumbnail}
                            alt={tutorial.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {tutorial.duration} min
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(cat => cat.id === tutorial.category)?.name}
                            </Badge>
                            <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          </div>

                          <h3 className="font-bold group-hover:text-primary transition-colors mb-2">
                            {tutorial.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {tutorial.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{tutorial.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>{tutorial.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{Math.floor(tutorial.views / 100) * 100}+</span>
                              </div>
                            </div>
                            <span>{tutorial.date}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {tutorial.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal para mostrar el video */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeVideoModal}
                className="absolute top-4 right-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                title={selectedVideo.title}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground">{selectedVideo.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span>{selectedVideo.duration} min</span>
                <span>{Math.floor(selectedVideo.views / 100) * 100}+ vistas</span>
                <span>{selectedVideo.likes} me gusta</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}