"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, MessageSquare, Phone, Globe, TrendingUp, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CategoryStat {
  name: string
  count: number
  percentage: string
}

interface GovernorateStat {
  name: string
  count: number
  percentage: string
}

interface RatingDistribution {
  rating: number
  count: number
  percentage: string
}

interface ContactInfo {
  withPhone: number
  withWebsite: number
  withBoth: number
  percentageWithPhone: string
  percentageWithWebsite: string
  percentageWithBoth: string
}

interface Aggregates {
  averageRating: string
  averageReviews: number
  maxRating: number
  minRating: number
  maxReviews: number
  minReviews: number
  topRatedCount: number
  topRatedPercentage: string
  highlyReviewedCount: number
  highlyReviewedPercentage: string
}

interface Statistics {
  total: number
  categories: CategoryStat[]
  governorates: GovernorateStat[]
  ratingDistribution: RatingDistribution[]
  contactInfo: ContactInfo
  aggregates: Aggregates
}

export function StatisticsPanel() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/places/stats')
      if (!response.ok) throw new Error('Failed to fetch statistics')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Total d'endroits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Note moyenne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.aggregates.averageRating}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.aggregates.topRatedCount.toLocaleString()} endroits avec note 4.5+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Avis moyens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.aggregates.averageReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.aggregates.highlyReviewedCount.toLocaleString()} endroits avec 100+ avis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Infos de contact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.contactInfo.percentageWithBoth}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              avec téléphone et site web
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution des catégories</CardTitle>
            <CardDescription>Principales catégories par nombre d'endroits</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {stats.categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="outline" className="shrink-0">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{category.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-sm font-bold">{category.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Governorates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution des gouvernorats</CardTitle>
            <CardDescription>Principaux gouvernorats par nombre d'endroits</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {stats.governorates.map((gov, index) => (
                  <div key={gov.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="outline" className="shrink-0">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{gov.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${gov.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-sm font-bold">{gov.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{gov.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Contact Info Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avec téléphone</span>
              </div>
              <Badge>{stats.contactInfo.withPhone.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avec site web</span>
              </div>
              <Badge>{stats.contactInfo.withWebsite.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avec les deux</span>
              </div>
              <Badge variant="default">{stats.contactInfo.withBoth.toLocaleString()}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rating Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques des notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Note maximale</span>
              <Badge variant="default">{stats.aggregates.maxRating}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Note minimale</span>
              <Badge variant="outline">{stats.aggregates.minRating}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Mieux notés (4.5+)</span>
              </div>
              <Badge className="bg-yellow-500 text-white">
                {stats.aggregates.topRatedPercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Review Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques des avis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Maximum d'avis</span>
              <Badge variant="default">{stats.aggregates.maxReviews?.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Minimum d'avis</span>
              <Badge variant="outline">{stats.aggregates.minReviews?.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Très commentés (100+)</span>
              </div>
              <Badge className="bg-blue-500 text-white">
                {stats.aggregates.highlyReviewedPercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
