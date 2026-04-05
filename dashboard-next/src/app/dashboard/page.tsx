'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  Book,
  Calendar,
  Home,
  Users,
  Globe,
  HeartHandshake,
  CalendarCheck,
  MessageSquare,
  ImageIcon,
  Command,
  Newspaper,
  Heart,
  LucideIcon,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useAllowedService } from '@/context/AllowedServiceContext';
import { useI18n } from '@/context/I18nContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardCardProps {
  serviceKey: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

const dashboardCards: DashboardCardProps[] = [
  { serviceKey: 'events', icon: Calendar, href: '/dashboard/events', color: 'from-orange-500 to-red-500' },
  { serviceKey: 'donations', icon: Heart, href: '/dashboard/donationsRecord', color: 'from-pink-500 to-rose-500' },
  { serviceKey: 'schedule', icon: Calendar, href: '/dashboard/schedule', color: 'from-blue-500 to-cyan-500' },
  { serviceKey: 'scheduleRegistrations', icon: CalendarCheck, href: '/dashboard/schedule-registrations', color: 'from-purple-500 to-pink-500' },
  { serviceKey: 'connect', icon: MessageSquare, href: '/dashboard/connect', color: 'from-green-500 to-teal-500' },
  { serviceKey: 'books', icon: Book, href: '/dashboard/books', color: 'from-amber-500 to-orange-500' },
  { serviceKey: 'rooms', icon: Home, href: '/dashboard/rooms', color: 'from-indigo-500 to-blue-500' },
  { serviceKey: 'users', icon: Users, href: '/dashboard/users', color: 'from-violet-500 to-purple-500' },
  { serviceKey: 'website', icon: Globe, href: '/dashboard/website', color: 'from-cyan-500 to-blue-500' },
  { serviceKey: 'volunteers', icon: HeartHandshake, href: '/dashboard/volunteer', color: 'from-emerald-500 to-green-500' },
  { serviceKey: 'glimpse', icon: ImageIcon, href: '/dashboard/glimpse', color: 'from-fuchsia-500 to-pink-500' },
  { serviceKey: 'imagelibrary', icon: ImageIcon, href: '/dashboard/imagelibrary', color: 'from-rose-500 to-red-500' },
  { serviceKey: 'printMedia', icon: Newspaper, href: '/dashboard/print-media', color: 'from-slate-500 to-gray-500' },
  { serviceKey: 'dikshaMantra', icon: Heart, href: '/dashboard/mantra-diksha', color: 'from-orange-500 to-amber-500' },
  { serviceKey: 'dailySchedule', icon: Calendar, href: '/dashboard/daily-schedule', color: 'from-teal-500 to-cyan-500' },
  { serviceKey: 'servicesManagement', icon: Command, href: '/dashboard/services', color: 'from-indigo-500 to-purple-500' },
];

export default function MainDashBoard() {
  const { isLoading, hasPermission } = useAllowedService();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const filteredCards = dashboardCards.filter(card => hasPermission(card.serviceKey));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950 p-8 md:p-10">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
              <span className="text-2xl text-white">🙏</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {t('dashboardPage.welcomeTitle')}
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
                {t('dashboardPage.welcomeSubtitle')}
              </p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
            {t('dashboardPage.welcomeDescription')}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{t('dashboardPage.stats.totalEvents')}</p>
                <h3 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">24</h3>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {t('dashboardPage.stats.growthThisMonth', { value: '+12%' })}
                </p>
              </div>
              <div className="p-4 bg-orange-500 rounded-xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 dark:text-pink-400">{t('dashboardPage.stats.donations')}</p>
                <h3 className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2">₹1.2L</h3>
                <p className="text-xs text-pink-600 dark:text-pink-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {t('dashboardPage.stats.growthThisMonth', { value: '+8%' })}
                </p>
              </div>
              <div className="p-4 bg-pink-500 rounded-xl shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('dashboardPage.stats.activeUsers')}</p>
                <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">1,248</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {t('dashboardPage.stats.growthThisMonth', { value: '+24%' })}
                </p>
              </div>
              <div className="p-4 bg-blue-500 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('dashboardPage.stats.volunteers')}</p>
                <h3 className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">342</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {t('dashboardPage.stats.growthThisMonth', { value: '+16%' })}
                </p>
              </div>
              <div className="p-4 bg-green-500 rounded-xl shadow-lg">
                <HeartHandshake className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('dashboardPage.managementPortal')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('dashboardPage.modulesAvailable', { count: filteredCards.length })}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCards.map((card, index) => (
            <Card
              key={card.serviceKey}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-2 hover:border-orange-200 dark:hover:border-orange-800"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {t(`dashboardPage.cards.${card.serviceKey}.title`)}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <CardDescription className="text-sm mb-4 line-clamp-2">
                  {t(`dashboardPage.cards.${card.serviceKey}.description`)}
                </CardDescription>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Link href={card.href}>{t(`dashboardPage.cards.${card.serviceKey}.linkText`)}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 border-2 border-orange-200 dark:border-orange-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('dashboardPage.needHelpTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboardPage.needHelpSubtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="bg-white dark:bg-gray-900">
              <Link href="/dashboard/services">{t('dashboardPage.viewGuides')}</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
              <a href="mailto:support@avdheshanandg.org">{t('dashboardPage.contactSupport')}</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
