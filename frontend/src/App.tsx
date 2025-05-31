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
  Divider,
  Avatar,
  Checkbox,
  ListItemText
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
  account_icon: string;
  organization_icon: string;
}

function App() {
  const initialLoad = useRef(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

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

  if (initialLoad.current) {
    const fetchDeals = async () => {
      try {
        const response = await fetch('http://localhost:3000/deals');
        const data = await response.json();
        setDeals(data.deals);
        // Initialize with all values
        setSelectedOrgs(data.deals.map((d: Deal) => d.organization_name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i));
        setSelectedStatuses(Array.from(new Set(data.deals.map((d: Deal) => d.status))) as string[]);
        setSelectedAccounts(data.deals.map((d: Deal) => d.account_name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i));
        const years = [...new Set(data.deals.flatMap((deal: Deal) => {
          const startYear = new Date(deal.start_date).getFullYear();
          const endYear = new Date(deal.end_date).getFullYear();
          const years = [];
          for (let year = startYear; year <= endYear; year++) {
            years.push(year.toString());
          }
          return years;
        }))];
        setSelectedYears(years as string[]);
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };

    fetchDeals();
    initialLoad.current = false;
  }

  const handleOrgChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedOrgs(typeof value === 'string' ? value.split(',') : value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedStatuses(typeof value === 'string' ? value.split(',') : value);
  };

  const handleAccountChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedAccounts(typeof value === 'string' ? value.split(',') : value);
  };

  const handleYearChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedYears(typeof value === 'string' ? value.split(',') : value);
  };

  const isYearInRange = (deal: Deal, selectedYears: string[]) => {
    if (selectedYears.length === uniqueYears.length) return true;
    
    const dealStartYear = new Date(deal.start_date).getFullYear();
    const dealEndYear = new Date(deal.end_date).getFullYear();
    
    return selectedYears.some(yearStr => {
      const year = parseInt(yearStr);
      return year >= dealStartYear && year <= dealEndYear;
    });
  };

  const filteredDeals = deals.filter(deal => {
    const matchesOrg = selectedOrgs.length === 0 || selectedOrgs.includes(deal.organization_name);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(deal.status);
    const matchesAccount = selectedAccounts.length === 0 || selectedAccounts.includes(deal.account_name);
    const matchesYear = isYearInRange(deal, selectedYears);
    return matchesOrg && matchesStatus && matchesAccount && matchesYear;
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
      <Box width={{ xs: '100%', sm: 325 }} minWidth={{ sm: 325 }} maxWidth={{ sm: 325 }} p={1}>
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
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar 
                    src={deal.account_icon}
                    alt={deal.account_name}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography>{deal.account_name}</Typography>
                </Box>
                <Typography color="text.secondary">${formatValue(deal.value)}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  };

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const statusesToRender = selectedStatuses.length === uniqueStatuses.length
    ? ['Build Proposal', 'Pitch Proposal', 'Negotiation', 'Active']
    : selectedStatuses;

  const totalValue = filteredDeals
    .filter(deal => statusesToRender.includes(deal.status))
    .reduce((sum, deal) => sum + deal.value, 0);

  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        overflow: 'auto'
      }
    },
    // Remove default focus on last item
    autoFocus: false,
    // Prevent menu from scrolling to selected item
    disableScrollLock: true
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Box my={4} mx={2}>
        <Paper elevation={0} sx={{ p: 2, mb: 4 }}>
          <Box display="flex" alignItems="center" gap={4}>
            <Typography variant="h4" component="h1">Deals</Typography>
            <Typography variant="h5" color="text.secondary">
              ${formatValue(totalValue)}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 4 }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <FormControl sx={{ minWidth: 175 }} variant="outlined">
              <InputLabel>Organization</InputLabel>
              <Select 
                multiple
                value={selectedOrgs}
                onChange={handleOrgChange}
                label="Organization"
                MenuProps={menuProps}
                renderValue={(selected) => selected.length === [...new Set(deals.map(deal => deal.organization_name))].length 
                  ? 'All Organizations' 
                  : `${selected.length} selected`}
              >
                {[...new Set(deals.map(deal => deal.organization_name))].map(org => {
                  const orgDeal = deals.find(d => d.organization_name === org);
                  return (
                    <MenuItem key={org} value={org} dense>
                      <Checkbox checked={selectedOrgs.includes(org)} size="small" />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar 
                          src={orgDeal?.organization_icon}
                          alt={org}
                          sx={{ width: 24, height: 24 }}
                        />
                        <ListItemText primary={org} primaryTypographyProps={{ variant: 'body2' }} />
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 175 }} variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select 
                multiple
                value={selectedStatuses}
                onChange={handleStatusChange}
                label="Status"
                MenuProps={menuProps}
                renderValue={(selected) => selected.length === uniqueStatuses.length 
                  ? 'All Statuses' 
                  : `${selected.length} selected`}
              >
                {uniqueStatuses.map(status => (
                  <MenuItem key={status} value={status} dense>
                    <Checkbox checked={selectedStatuses.includes(status)} size="small" />
                    <ListItemText primary={status} primaryTypographyProps={{ variant: 'body2' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 175 }} variant="outlined">
              <InputLabel>Account</InputLabel>
              <Select 
                multiple
                value={selectedAccounts}
                onChange={handleAccountChange}
                label="Account"
                MenuProps={menuProps}
                renderValue={(selected) => selected.length === [...new Set(deals.map(deal => deal.account_name))].length 
                  ? 'All Accounts' 
                  : `${selected.length} selected`}
              >
                {[...new Set(deals.map(deal => deal.account_name))].map(account => {
                  const accountDeal = deals.find(d => d.account_name === account);
                  return (
                    <MenuItem key={account} value={account} dense>
                      <Checkbox checked={selectedAccounts.includes(account)} size="small" />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar 
                          src={accountDeal?.account_icon}
                          alt={account}
                          sx={{ width: 24, height: 24 }}
                        />
                        <ListItemText primary={account} primaryTypographyProps={{ variant: 'body2' }} />
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 175 }} variant="outlined">
              <InputLabel>Year</InputLabel>
              <Select 
                multiple
                value={selectedYears}
                onChange={handleYearChange}
                label="Year"
                MenuProps={menuProps}
                renderValue={(selected) => selected.length === uniqueYears.length 
                  ? 'All Years' 
                  : `${selected.length} selected`}
              >
                {uniqueYears.map(year => (
                  <MenuItem key={year} value={year.toString()} dense>
                    <Checkbox checked={selectedYears.includes(year.toString())} size="small" />
                    <ListItemText primary={year.toString()} primaryTypographyProps={{ variant: 'body2' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} flexWrap={{ sm: 'wrap' }}>
          {statusesToRender.map(status => renderDealsByStatus(status))}
        </Box>
      </Box>
    </Container>
  );
}

export default App;