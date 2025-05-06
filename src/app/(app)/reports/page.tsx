
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart as RechartsBarChart, PieChart as RechartsPieChart, LineChart as RechartsLineChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Loader2, AlertCircle, Users, CalendarCheck, CalendarX, UserCheck, UserX, FileText, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Dummy data fetching function - replace with actual API calls
const fetchReportData = async (filter?: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, fetch this data from your backend
  return {
    meetingsOverview: [
      { name: 'Scheduled', value: filter === 'last_month' ? 8 : 12, fill: "var(--color-scheduled)" },
      { name: 'Held', value: filter === 'last_month' ? 25 : 38, fill: "var(--color-held)" },
      { name: 'Archived', value: filter === 'last_month' ? 3 : 5, fill: "var(--color-archived)" },
    ],
    userStatus: [
      { name: 'Active Users', value: filter === 'last_month' ? 40 : 45, fill: "var(--color-active)" },
      { name: 'Inactive Users', value: filter === 'last_month' ? 3 : 5, fill: "var(--color-inactive)" },
    ],
    userRoles: [
        { name: 'Chairmen', value: 1, fill: "var(--color-chairmen)" },
        { name: 'Directors', value: 5, fill: "var(--color-directors)" },
        { name: 'Delegates', value: 39, fill: "var(--color-delegates)" },
    ],
    meetingAttendance: [ // Example: Attendance over last 6 months
      { month: 'Jan', attended: 20, scheduled: 25 },
      { month: 'Feb', attended: 22, scheduled: 28 },
      { month: 'Mar', attended: 18, scheduled: 22 },
      { month: 'Apr', attended: 25, scheduled: 30 },
      { month: 'May', attended: 23, scheduled: 26 },
      { month: 'Jun', attended: 28, scheduled: 32 },
    ],
    documentStats: [
        { name: 'Approved', value: 150, fill: "var(--color-doc-approved)" },
        { name: 'Pending', value: 20, fill: "var(--color-doc-pending)" },
        { name: 'Rejected', value: 10, fill: "var(--color-doc-rejected)" },
    ]
  };
};

const meetingsChartConfig = {
  value: { label: "Count" },
  scheduled: { label: "Scheduled", color: "hsl(var(--chart-1))" },
  held: { label: "Held", color: "hsl(var(--chart-2))" },
  archived: { label: "Archived", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const userStatusChartConfig = {
  value: { label: "Users" },
  active: { label: "Active", color: "hsl(var(--chart-1))" },
  inactive: { label: "Inactive", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

const userRolesChartConfig = {
    value: { label: "Users" },
    chairmen: { label: "Chairmen", color: "hsl(var(--chart-1))" },
    directors: { label: "Directors", color: "hsl(var(--chart-2))" },
    delegates: { label: "Delegates", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const documentStatsChartConfig = {
    value: { label: "Documents" },
    "doc-approved": { label: "Approved", color: "hsl(var(--chart-2))" },
    "doc-pending": { label: "Pending", color: "hsl(var(--chart-4))" },
    "doc-rejected": { label: "Rejected", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-semibold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs">{`Count ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isFetching, setIsFetching] = React.useState(true);
  const [timeFilter, setTimeFilter] = React.useState<string>("all_time");
  const [activePieIndex, setActivePieIndex] = React.useState<{ [key: string]: number }>({
    meetings: 0,
    users: 0,
    roles: 0,
    documents: 0,
  });

  const onPieEnter = React.useCallback((_: any, index: number, chartKey: string) => {
    setActivePieIndex(prev => ({...prev, [chartKey]: index }));
  }, []);


  React.useEffect(() => {
    if (!loading && user && !['Chairman', 'Director'].includes(user.role)) {
      router.push('/dashboard'); // Or appropriate page
      toast({ title: 'Access Denied', description: 'You do not have permission to view reports.', variant: 'destructive'});
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user && ['Chairman', 'Director'].includes(user.role)) {
      setIsFetching(true);
      fetchReportData(timeFilter)
        .then(data => {
          setReportData(data);
          setError(null);
        })
        .catch(err => {
          console.error("Failed to fetch report data:", err);
          setError("Could not load report data. Please try again later.");
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else if (!loading && !user) {
        setIsFetching(false); // Stop fetching if no user (redirect will occur)
    }
  }, [user, loading, timeFilter]);

  if (loading || isFetching) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    </div>;
  }

  if (!user || !['Chairman', 'Director'].includes(user.role)) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You do not have permission to view this page.</AlertDescription>
        </Alert>
    </div>;
  }


  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports Dashboard</h1>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_time">All Time</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_quarter">Last Quarter</SelectItem>
            <SelectItem value="last_year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Key Metrics Summary Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><CalendarCheck className="h-4 w-4"/>Total Meetings Held</CardDescription>
            <CardTitle className="text-4xl">{reportData?.meetingsOverview?.find((m:any) => m.name === 'Held')?.value ?? 'N/A'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Based on selected filter</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Users className="h-4 w-4"/>Total Active Users</CardDescription>
            <CardTitle className="text-4xl">{reportData?.userStatus?.find((u:any) => u.name === 'Active Users')?.value ?? 'N/A'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Current count of active users</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><FileText className="h-4 w-4"/>Approved Documents</CardDescription>
            <CardTitle className="text-4xl">{reportData?.documentStats?.find((d:any) => d.name === 'Approved')?.value ?? 'N/A'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Total approved documents</div>
          </CardContent>
        </Card>
      </div>


      <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Meetings Overview</CardTitle>
            <CardDescription>Breakdown of meeting statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={meetingsChartConfig} className="aspect-square h-[300px] w-full">
              <RechartsBarChart accessibilityLayer data={reportData?.meetingsOverview} layout="vertical" margin={{left: 10, right: 20}}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="value" />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={5}>
                    {reportData?.meetingsOverview?.map((entry:any, index:number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Status</CardTitle>
            <CardDescription>Active vs. Inactive users.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={userStatusChartConfig} className="aspect-square h-[300px] w-full">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie
                  data={reportData?.userStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  activeIndex={activePieIndex['users']}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => onPieEnter(_, index, 'users')}
                >
                 {reportData?.userStatus?.map((entry:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Breakdown of users by their roles.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={userRolesChartConfig} className="aspect-square h-[300px] w-full">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie
                  data={reportData?.userRoles}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  activeIndex={activePieIndex['roles']}
                  activeShape={renderActiveShape}
                   onMouseEnter={(_, index) => onPieEnter(_, index, 'roles')}
                >
                 {reportData?.userRoles?.map((entry:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Document Status Overview</CardTitle>
                <CardDescription>Distribution of documents by approval status.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={documentStatsChartConfig} className="aspect-square h-[300px] w-full">
                <RechartsBarChart accessibilityLayer data={reportData?.documentStats} layout="vertical" margin={{left: 10, right: 20}}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="value" />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" radius={5}>
                        {reportData?.documentStats?.map((entry:any, index:number) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

       <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Meeting Attendance Trend</CardTitle>
            <CardDescription>Number of attendees vs. scheduled meetings over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[350px] w-full"> {/* Empty config for basic line chart styling */}
              <RechartsLineChart data={reportData?.meetingAttendance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="attended" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Attended Meetings" />
                <Line type="monotone" dataKey="scheduled" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Scheduled Meetings" />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

    </div>
  );
}

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> } // Simplified theme for this example
  )
}

