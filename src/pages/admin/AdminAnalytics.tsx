
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyCollectionData = [
  { name: 'Jan', generalWaste: 400, recycling: 240, organic: 180 },
  { name: 'Feb', generalWaste: 380, recycling: 250, organic: 190 },
  { name: 'Mar', generalWaste: 450, recycling: 300, organic: 210 },
  { name: 'Apr', generalWaste: 420, recycling: 280, organic: 200 },
  { name: 'May', generalWaste: 390, recycling: 320, organic: 220 },
];

const wasteDistributionData = [
  { name: 'General Waste', value: 40 },
  { name: 'Recycling', value: 35 },
  { name: 'Organic', value: 25 },
];

const areaComparisonData = [
  { name: 'Downtown', generalWaste: 420, recycling: 300, organic: 200 },
  { name: 'Westside', generalWaste: 380, recycling: 250, organic: 180 },
  { name: 'Eastside', generalWaste: 400, recycling: 280, organic: 190 },
  { name: 'Northside', generalWaste: 350, recycling: 260, organic: 170 },
  { name: 'Southside', generalWaste: 390, recycling: 270, organic: 160 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">View and analyze waste management data and trends.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,285</div>
            <p className="text-xs text-muted-foreground">+6% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recycling Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35.8%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resident Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+3% from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">-8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="waste">Waste Types</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collections</CardTitle>
              <CardDescription>Collection volume trends over the past 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-80" config={{
                generalWaste: { color: "#0088FE", label: "General Waste" },
                recycling: { color: "#00C49F", label: "Recycling" },
                organic: { color: "#FFBB28", label: "Organic" }
              }}>
                <AreaChart data={monthlyCollectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGeneralWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRecycling" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFBB28" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="generalWaste" stroke="#0088FE" fillOpacity={1} fill="url(#colorGeneralWaste)" />
                  <Area type="monotone" dataKey="recycling" stroke="#00C49F" fillOpacity={1} fill="url(#colorRecycling)" />
                  <Area type="monotone" dataKey="organic" stroke="#FFBB28" fillOpacity={1} fill="url(#colorOrganic)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="waste" className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Waste Type Distribution</CardTitle>
              <CardDescription>Breakdown of waste collection by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {wasteDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends by Type</CardTitle>
              <CardDescription>Changes in waste volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-80" config={{
                generalWaste: { color: "#0088FE", label: "General Waste" },
                recycling: { color: "#00C49F", label: "Recycling" },
                organic: { color: "#FFBB28", label: "Organic" }
              }}>
                <LineChart data={monthlyCollectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="generalWaste" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="recycling" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="organic" stroke="#FFBB28" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="areas">
          <Card>
            <CardHeader>
              <CardTitle>Area Comparison</CardTitle>
              <CardDescription>Waste collection by area and type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-80" config={{
                generalWaste: { color: "#0088FE", label: "General Waste" },
                recycling: { color: "#00C49F", label: "Recycling" },
                organic: { color: "#FFBB28", label: "Organic" }
              }}>
                <BarChart data={areaComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="generalWaste" fill="#0088FE" />
                  <Bar dataKey="recycling" fill="#00C49F" />
                  <Bar dataKey="organic" fill="#FFBB28" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
