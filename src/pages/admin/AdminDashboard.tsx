import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the waste management system administration.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/residents" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalResidents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Click to view all residents</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/collections" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.collectionSuccessRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Click to view collections</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/feedback" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.pendingIssues}</div>
                  <p className="text-xs text-muted-foreground">Click to view all issues</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/schedules" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.todayCollections}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-muted-foreground mr-2">Progress:</span>
                    <Progress value={stats?.todayCollectionProgress} className="h-2" />
                    <span className="text-xs ml-2">{stats?.todayCollectionProgress}%</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Recent Issues</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Collection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Status by Area</CardTitle>
              <CardDescription>Today's collection progress by neighborhood</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between mb-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.areaProgress.map((area, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium">{area.name}</div>
                        <div className="text-sm font-medium">{area.progress}%</div>
                      </div>
                      <Progress value={area.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Waste Collection Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Collection Types</CardTitle>
                <CardDescription>Distribution of waste types this month</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                {isLoading ? (
                  <div className="w-full h-24 animate-pulse bg-gray-200 rounded"></div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-tw-green-500 mr-2"></div>
                        <div className="text-sm">General Waste ({stats?.wasteDistribution.general}%)</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-tw-blue-500 mr-2"></div>
                        <div className="text-sm">Recycling ({stats?.wasteDistribution.recycling}%)</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <div className="text-sm">Organic ({stats?.wasteDistribution.organic}%)</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        <div className="text-sm">Hazardous ({stats?.wasteDistribution.hazardous}%)</div>
                      </div>
                    </div>
                    <div className="w-24 h-24 rounded-full border-8 border-tw-green-500 relative">
                      <div className="absolute inset-0 border-t-8 border-r-8 border-tw-blue-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}></div>
                      <div className="absolute inset-0 border-t-8 border-yellow-500 rounded-full" style={{ clipPath: 'polygon(0 0, 32% 0, 0 32%)' }}></div>
                      <div className="absolute inset-0 border-l-8 border-purple-500 rounded-full" style={{ clipPath: 'polygon(0 32%, 0 12%, 12% 0)' }}></div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Feedback Overview</CardTitle>
                <CardDescription>Customer feedback statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="flex justify-between mb-1">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm font-medium">
                        <div>Positive Feedback</div>
                        <div>{stats?.feedbackStats.positive}%</div>
                      </div>
                      <Progress value={stats?.feedbackStats.positive} className="h-2 bg-gray-200">
                        <div className="h-full bg-green-500 rounded-full"></div>
                      </Progress>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm font-medium">
                        <div>Neutral Feedback</div>
                        <div>{stats?.feedbackStats.neutral}%</div>
                      </div>
                      <Progress value={stats?.feedbackStats.neutral} className="h-2 bg-gray-200">
                        <div className="h-full bg-blue-500 rounded-full"></div>
                      </Progress>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm font-medium">
                        <div>Negative Feedback</div>
                        <div>{stats?.feedbackStats.negative}%</div>
                      </div>
                      <Progress value={stats?.feedbackStats.negative} className="h-2 bg-gray-200">
                        <div className="h-full bg-red-500 rounded-full"></div>
                      </Progress>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>Reported issues from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Multiple Missed Collections</h3>
                      <p className="text-sm text-gray-600">
                        Several residents on Elm Street reported their recycling wasn't collected.
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full whitespace-nowrap">
                      High Priority
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 flex justify-between">
                    <p>Reported by: 8 residents</p>
                    <p>May 4, 2025</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Collection Truck Noise Complaint</h3>
                      <p className="text-sm text-gray-600">
                        Residents complaining about early morning noise from collection vehicles.
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap">
                      Medium Priority
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 flex justify-between">
                    <p>Reported by: 3 residents</p>
                    <p>May 3, 2025</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Schedule Confusion</h3>
                      <p className="text-sm text-gray-600">
                        Multiple residents unsure about holiday collection schedule changes.
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap">
                      Medium Priority
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 flex justify-between">
                    <p>Reported by: 12 residents</p>
                    <p>May 2, 2025</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Improper Waste Disposal</h3>
                      <p className="text-sm text-gray-600">
                        Reports of hazardous materials in regular waste bins in Oak neighborhood.
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full whitespace-nowrap">
                      High Priority
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 flex justify-between">
                    <p>Reported by: 2 collectors</p>
                    <p>May 1, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Collection Performance Trends</CardTitle>
                <CardDescription>Collection metrics over the last 6 months</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full bg-slate-50 rounded-md border flex items-center justify-center text-sm text-muted-foreground">
                [Collection Performance Chart]
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Collection Rate</div>
                  <div className="text-2xl font-bold">96.8%</div>
                  <div className="text-xs flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" /> 1.2% increase
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">On-time Performance</div>
                  <div className="text-2xl font-bold">92.4%</div>
                  <div className="text-xs flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" /> 0.8% increase
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
