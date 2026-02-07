import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  BarChart3, 
  Bell, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
  Package,
  Users,
  Clock,
  Star,
  Sparkles,
  Target,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-inventory.jpg';
import logo from '@/assets/logo.png';

const features = [
  {
    icon: Package,
    title: 'Product Management',
    description: 'Add, edit, and organize your products with ease. Track SKUs, categories, and pricing all in one place.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified when stock runs low. Never miss a reorder with automated threshold alerts.',
  },
  {
    icon: ShoppingCart,
    title: 'Sales Tracking',
    description: 'Record sales instantly and watch your inventory update in real-time. Track revenue effortlessly.',
  },
  {
    icon: BarChart3,
    title: 'Insightful Reports',
    description: 'Understand your business with visual analytics. See trends, top sellers, and inventory value.',
  },
];

const benefits = [
  'No more spreadsheet chaos',
  'Real-time stock visibility',
  'Reduce stockouts by 80%',
  'Save hours every week',
];

const stats = [
  { value: '10K+', label: 'Products Managed', icon: Package },
  { value: '5K+', label: 'Happy Users', icon: Users },
  { value: '99.9%', label: 'Uptime', icon: Zap },
  { value: '24/7', label: 'Support', icon: Clock },
];

const steps = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Sign up in seconds with just your email. No credit card required to get started.',
    icon: Rocket,
  },
  {
    step: '02',
    title: 'Add Your Products',
    description: 'Import from Excel or add products manually. Set stock levels and pricing with ease.',
    icon: Package,
  },
  {
    step: '03',
    title: 'Track & Grow',
    description: 'Monitor sales, get alerts, and make data-driven decisions to grow your business.',
    icon: Target,
  },
];

const testimonials = [
  {
    quote: "This app transformed how I manage my boutique. I used to spend hours on spreadsheets, now it's all automated!",
    author: "Sarah Johnson",
    role: "Boutique Owner",
    rating: 5,
  },
  {
    quote: "The low stock alerts alone saved me from countless stockouts. My customers are happier than ever.",
    author: "Michael Chen",
    role: "Electronics Retailer",
    rating: 5,
  },
  {
    quote: "Simple, intuitive, and powerful. Exactly what a small business needs for inventory management.",
    author: "Emily Rodriguez",
    role: "Craft Store Owner",
    rating: 5,
  },
];

// Floating animation component
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Interactive card with tilt effect
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl"
          style={{ y: backgroundY }}
        />
        <motion.div 
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/10 via-transparent to-transparent rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <img src={logo} alt="Inventory Management" className="h-12 w-auto" />
            </Link>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <Link to="/signin">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost">Sign In</Button>
              </motion.div>
            </Link>
            <Link to="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-20 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Simple. Powerful. Efficient.
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              >
                Inventory management{' '}
                <motion.span 
                  className="text-primary inline-block"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  made simple
                </motion.span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-lg">
                Stop losing track of stock. Our platform helps small businesses manage inventory, 
                track sales, and stay on top of reorders — all in one intuitive platform.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="gap-2 text-base">
                      Loign
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 pt-4">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={benefit} 
                    className="flex items-center gap-2 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <TiltCard className="relative rounded-2xl overflow-hidden card-shadow-lg">
                <img 
                  src={heroImage} 
                  alt="Inventory management illustration" 
                  className="w-full h-auto"
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                />
              </TiltCard>
              
              {/* Floating stats card */}
              <FloatingElement delay={0}>
                <motion.div 
                  className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 card-shadow-lg border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">+27%</p>
                      <p className="text-xs text-muted-foreground">Efficiency Boost</p>
                    </div>
                  </div>
                </motion.div>
              </FloatingElement>

              {/* Additional floating element */}
              <FloatingElement delay={1.5}>
                <motion.div 
                  className="absolute -top-4 -right-4 rounded-xl bg-card p-3 card-shadow-lg border"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10">
                      <Bell className="h-4 w-4 text-warning" />
                    </div>
                    <span className="text-sm font-medium">Low Stock Alert!</span>
                  </div>
                </motion.div>
              </FloatingElement>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/20">
        <div className="container">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className="flex justify-center mb-3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold text-primary"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: index * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything you need to manage inventory
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for small business owners who want to spend less time 
              on paperwork and more time growing their business.
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 40px -20px hsl(var(--primary) / 0.3)"
                }}
                className="group rounded-xl border bg-card p-6 card-shadow transition-colors cursor-pointer"
              >
                <motion.div 
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <feature.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Get started in 3 simple steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Setting up your inventory management has never been easier.
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={step.step}
                variants={itemVariants}
                className="relative"
              >
                <motion.div 
                  className="bg-card rounded-2xl p-8 border card-shadow h-full"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="text-6xl font-bold text-primary/10 mb-4"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {step.step}
                  </motion.div>
                  <motion.div 
                    className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <step.icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <motion.div 
                    className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Loved by business owners
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about their experience.
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.author}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="bg-card rounded-2xl p-6 border card-shadow h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <Star className="h-5 w-5 fill-warning text-warning" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-muted-foreground flex-grow mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div 
            className="relative rounded-2xl bg-primary overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            
            {/* Animated particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
            
            <div className="relative px-8 py-16 text-center text-primary-foreground">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Shield className="h-12 w-12 mx-auto mb-6 opacity-90" />
              </motion.div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Ready to take control of your inventory?
              </h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
                Join thousands of small business owners who've simplified their stock management.
              </p>
              <Link to="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button size="lg" variant="secondary" className="gap-2 text-base">
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <motion.div 
            className="flex flex-col items-center justify-between gap-4 md:flex-row"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <img src={logo} alt="Inventory Management" className="h-10 w-auto" />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              © 2026 Inventory Management. Built for small businesses.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;