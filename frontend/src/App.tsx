import { useState, useRef } from 'react';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  SelectChangeEvent,
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';

interface Deal {
  id: number;
  organization_id: number;
  account_id: number;
  start_date: string;
  end_date: string;
  value: number;
  status: string;
  account_name: string;
  organization_name: string;
}

function App() {
  const initialLoad = useRef(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  if (initialLoad.current) {
    const fetchDeals = async () => {
      try {
        const response = await fetch('http://localhost:3000/deals');
        const data = await response.json();
        setDeals(data.deals);
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };

    fetchDeals();
    initialLoad.current = false;
  }

  const handleOrgChange = (event: SelectChangeEvent) => {
    setSelectedOrg(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value);
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    setSelectedYear(event.target.value);
  };

  const isYearInRange = (deal: Deal, year: number) => {
    const startYear = new Date(deal.start_date).getFullYear();
    const endYear = new Date(deal.end_date).getFullYear();
    return year >= startYear && year <= endYear;
  };

  const filteredDeals = deals.filter(deal => {
    const matchesOrg = selectedOrg === 'All' || deal.organization_name === selectedOrg;
    const matchesStatus = selectedStatus === 'All' || deal.status === selectedStatus;
    const matchesYear = selectedYear === 'All' || isYearInRange(deal, parseInt(selectedYear));
    return matchesOrg && matchesStatus && matchesYear;
  });

  const renderDealsByStatus = (status: string) => {
    const dealsInStatus = filteredDeals.filter(deal => deal.status === status);
    const totalValue = dealsInStatus.reduce((sum, deal) => sum + deal.value, 0);
    
    const formatValue = (value: number) => {
      return value.toLocaleString('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    };
    
    return (
      <Box width="30%" p={2}>
        <Card elevation={3}>
          <CardHeader
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{status}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  ${formatValue(totalValue)}
                </Typography>
              </Box>
            }
          />
          <Divider />
          <CardContent>
            {dealsInStatus.map(deal => (
              <Box key={deal.id} display="flex" justifyContent="space-between" mb={1}>
                <Typography>{deal.account_name}</Typography>
                <Typography color="text.secondary">${formatValue(deal.value)}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  };

  const uniqueStatuses = [...new Set(deals.map(deal => deal.status))];
  const uniqueYears = [...new Set(deals.flatMap(deal => {
    const startYear = new Date(deal.start_date).getFullYear();
    const endYear = new Date(deal.end_date).getFullYear();
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  }))].sort();

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">Deals Overview</Typography>
          <Typography variant="h5" color="text.secondary">
            ${formatValue(totalValue)}
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 2, mb: 4 }}>
          <Box display="flex" gap={2}>
            <FormControl sx={{ minWidth: 200 }} variant="outlined">
              <InputLabel>Organization</InputLabel>
              <Select value={selectedOrg} onChange={handleOrgChange} label="Organization">
                <MenuItem value="All">All Organizations</MenuItem>
                {[...new Set(deals.map(deal => deal.organization_name))].map(org => (
                  <MenuItem key={org} value={org}>{org}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }} variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} onChange={handleStatusChange} label="Status">
                <MenuItem value="All">All Statuses</MenuItem>
                {uniqueStatuses.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }} variant="outlined">
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} onChange={handleYearChange} label="Year">
                <MenuItem value="All">All Years</MenuItem>
                {uniqueYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <Box display="flex" gap={3}>
          {renderDealsByStatus('Build Proposal')}
          {renderDealsByStatus('Pitch Proposal')}
          {renderDealsByStatus('Negotiation')}
        </Box>
      </Box>
    </Container>
  );
}

export default App;