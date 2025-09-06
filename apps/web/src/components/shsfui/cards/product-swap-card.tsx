"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Edit, Play, Pause, CheckCircle, Heart, AlertTriangle, Archive, Flag, User } from "lucide-react";
import { motion, AnimatePresence, MotionProps } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserAvatarCompact } from "@/components/user-avatar";

type ProductData = {
  title: string;
  excerpt: string;
  createdAt: string;
  domain: string;
  slug: string;
  alt: string[];
  techStack: string[];
  thumbnail: string[];
  actionLabel?: string;
  status?: string;
  priority?: string;
  deadline?: string | Date;
  projectManager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  } | null;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  } | null;
};

const DEFAULT_PRODUCT: ProductData = {
  title: "SHSF Dashboard Application",
  excerpt:
    "Modern, responsive dashboard application built with React and Next.js. Features include real-time analytics, user management, and customizable widgets.",
  createdAt: "March 18, 2025",
  domain: "shsf-dashboard.dev",
  actionLabel: "View product",
  slug: "shsf-dashboard",
  status: "active",
  priority: "high",
  alt: [
    "SHSF Dashboard dark mode interface showing analytics charts",
    "SHSF Dashboard light mode interface showing user management panel",
  ],
  techStack: [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Framer Motion",
  ],
  thumbnail: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=640&h=360&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=640&h=360&auto=format&fit=crop",
  ],
};

type ProductSwapCardProps = React.HTMLAttributes<HTMLDivElement> &
  MotionProps & {
    product?: ProductData;
    onSwap?: (isFirstVisible: boolean) => void;
  };

// Helper function to get status/priority styling
const getStatusConfig = (type: 'status' | 'priority', value: string) => {
  if (type === 'status') {
    switch (value) {
      case 'active':
        return {
          icon: Play,
          glowColor: 'shadow-[0_0_12px_rgba(34,197,94,0.3)]',
          iconColor: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-400/30'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          glowColor: 'shadow-[0_0_12px_rgba(34,197,94,0.3)]',
          iconColor: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-400/30'
        };
      case 'on_hold':
        return {
          icon: Pause,
          glowColor: 'shadow-[0_0_12px_rgba(156,163,175,0.3)]',
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-400/30'
        };
      case 'cancelled':
        return {
          icon: Archive,
          glowColor: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
          iconColor: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-400/30'
        };
      default:
        return {
          icon: Play,
          glowColor: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-400/30'
        };
    }
  } else { // priority
    switch (value) {
      case 'high':
        return {
          icon: AlertTriangle,
          glowColor: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
          iconColor: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-400/30'
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          glowColor: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
          iconColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-400/30'
        };
      case 'low':
        return {
          icon: CheckCircle,
          glowColor: 'shadow-[0_0_12px_rgba(34,197,94,0.3)]',
          iconColor: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-400/30'
        };
      default:
        return {
          icon: AlertTriangle,
          glowColor: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-400/30'
        };
    }
  }
};

const ProductSwapCard = React.forwardRef<HTMLDivElement, ProductSwapCardProps>(
  (props, ref) => {
    const {
      product = DEFAULT_PRODUCT,
      className,
      onSwap,
      ...restProps
    } = props;

    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const thumbnails = product.thumbnail;

    const handleSwap = () => {
      if (isTransitioning) return;

      setIsTransitioning(true);
      const nextIndex = (activeIndex + 1) % thumbnails.length;
      setActiveIndex(nextIndex);

      if (onSwap) {
        onSwap(nextIndex === 0);
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "w-full space-y-4 rounded-lg bg-sidebar p-4 border max-w-96 overflow-hidden",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        {...restProps}
      >
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleSwap}
            size="icon"
            variant="outline"
            className={cn(
              "shrink-0 transition-all duration-200 shadow-sm",
              isTransitioning && "pointer-events-none opacity-70"
            )}
            aria-label={`Show ${activeIndex === 0 ? "next" : "previous"} image`}
            disabled={isTransitioning}
          >
            <div className="transition-transform duration-500 ease-out">
              <ChevronDown
                size={20}
                strokeWidth={1.5}
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  activeIndex === 1 && "rotate-180"
                )}
              />
            </div>
          </Button>

          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <AnimatePresence initial={false}>
              {thumbnails.map((src, index) => (
                <motion.div
                  key={`${src}-${index}`}
                  className={cn(
                    "absolute inset-0 h-full w-full",
                    activeIndex === index ? "z-10" : "z-0"
                  )}
                  initial={false}
                  animate={{
                    opacity: activeIndex === index ? 1 : 0,
                    scale: activeIndex === index ? 1 : 0.92,
                    y:
                      activeIndex === index
                        ? 0
                        : index < activeIndex
                        ? "-100%"
                        : "100%",
                  }}
                  transition={{
                    opacity: { duration: 0.5, ease: "easeInOut" },
                    scale: { duration: 0.5, ease: "easeOut" },
                    y: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
                  }}
                >
                  <div className="h-full w-full overflow-hidden rounded-xl border">
                    <img
                      src={src}
                      alt={product.alt[index]}
                      className="h-full w-full object-cover transition-all duration-500"
                      style={{
                        objectPosition: index === 0 ? "top" : "center",
                      }}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Image indicators */}
            <div className="absolute bottom-2 right-2 z-20 flex gap-1.5 rounded-full bg-black/30 backdrop-blur-sm px-2 py-1.5 shadow-sm border border-white/20">
              {thumbnails.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isTransitioning && setActiveIndex(index)}
                  className={cn(
                    "size-2 rounded-full transition-all duration-300 cursor-pointer",
                    activeIndex === index
                      ? "bg-white scale-110 ring-1 ring-white/50 ring-offset-1 ring-offset-black/30"
                      : "bg-white/60 hover:bg-white/80"
                  )}
                  aria-label={`View image ${index + 1}`}
                  disabled={isTransitioning}
                />
              ))}
            </div>

          </div>
        </div>

         <div className="space-y-3">
           <div className="space-y-2">
             <div className="flex items-start justify-between gap-2">
               <h2 className="line-clamp-1 font-medium flex-1 cursor-pointer hover:text-primary transition-colors"
                   onClick={() => {
                     // Determine if this is a task or project based on the presence of assignee
                     if (product.assignee) {
                       window.location.href = `/tasks/${product.slug}`;
                     } else {
                       window.location.href = `/projects/${product.slug}`;
                     }
                   }}>
                 {product.title}
               </h2>
               <Button variant="ghost" size="sm" asChild className="shrink-0 h-6 w-6 p-0">
                 <Link href={product.assignee ? `/tasks/${product.slug}/edit` : `/projects/${product.slug}/edit`}>
                   <Edit className="h-3 w-3" />
                 </Link>
               </Button>
             </div>
             <p className="line-clamp-3 text-sm text-muted-foreground">
               {product.excerpt}
             </p>
           </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              {product.techStack.map((tag, index) => (
                <div
                  key={index}
                  className="shrink-0 px-2 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md bg-blue-500/20 border border-blue-400/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                >
                  {tag}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>

           {/* Status and Priority Badges with Created Date */}
           <div className="flex items-center justify-between gap-2 text-xs">
             <time className="text-muted-foreground flex-shrink-0">{product.createdAt}</time>
             <div className="flex gap-1.5 flex-shrink-0">
               {product.status && (() => {
                 const config = getStatusConfig('status', product.status);
                 const IconComponent = config.icon;
                 return (
                   <div className={cn(
                     "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md border whitespace-nowrap",
                     config.bgColor,
                     config.borderColor,
                     config.glowColor
                   )}>
                     <IconComponent className={cn("h-3 w-3", config.iconColor)} />
                     {product.status.replace("_", " ")}
                   </div>
                 );
               })()}
               {product.priority && (() => {
                 const config = getStatusConfig('priority', product.priority);
                 const IconComponent = config.icon;
                 return (
                   <div className={cn(
                     "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md border whitespace-nowrap",
                     config.bgColor,
                     config.borderColor,
                     config.glowColor
                   )}>
                     <IconComponent className={cn("h-3 w-3", config.iconColor)} />
                     {product.priority}
                   </div>
                 );
               })()}
             </div>
           </div>

           {/* Bottom Section: Deadline and Avatar */}
           <div className="flex items-center justify-between pt-3 border-t border-border/30">
             <div className="flex items-center gap-2">
               {product.deadline && (
                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                   <Flag className="h-3 w-3" />
                   <span>
                     {typeof product.deadline === 'string'
                       ? new Date(product.deadline).toLocaleDateString('en-GB', {
                           day: '2-digit',
                           month: '2-digit',
                           year: '2-digit'
                         })
                       : product.deadline.toLocaleDateString('en-GB', {
                           day: '2-digit',
                           month: '2-digit',
                           year: '2-digit'
                         })
                     }
                   </span>
                 </div>
               )}
             </div>

             {/* Avatar Section */}
             <div className="flex items-center gap-2">

               {product.assignee && (
                 <div className="flex items-center gap-1.5">
                   <UserAvatarCompact
                     user={product.assignee}
                     size="sm"
                     tooltipContent="Task Assignee"
                   />
                 </div>
               )}
               {product.projectManager && (
                 <div className="flex items-center gap-1.5">
                   <UserAvatarCompact
                     user={product.projectManager}
                     size="sm"
                     tooltipContent="Project Manager"
                   />
                 </div>
               )}
             </div>
           </div>
        </div>
      </motion.div>
    );
  }
);

ProductSwapCard.displayName = "ProductSwapCard";

export { ProductSwapCard };
