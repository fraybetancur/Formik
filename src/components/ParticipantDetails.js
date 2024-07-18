import React, { useState } from 'react';
import { AppBar, Tabs, Tab, Box, Grid, TextField, Avatar, Button, MenuItem, Typography } from '@mui/material';

const ParticipantDetails = ({ participant, onSave, onCancel }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState(participant);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Box>
      <AppBar position="static">
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Biographic" />
          <Tab label="Travel Requirements" />
          <Tab label="Contact Details" />
          <Tab label="Documents" />
          <Tab label="Education/Language" />
          <Tab label="Employment Skills" />
          <Tab label="Other Information" />
        </Tabs>
      </AppBar>
      <TabPanel value={selectedTab} index={0}>
        <BiographicTab formData={formData} handleChange={handleChange} />
      </TabPanel>
      {/* Similar TabPanels for other sections */}
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '8px' }}>
          Save Case Member
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
};

const BiographicTab = ({ formData, handleChange }) => (
  <Box>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Avatar src={formData.photo} style={{ width: '100px', height: '100px' }} />
        <Button variant="contained" component="label" style={{ marginTop: '8px' }}>
          Upload Photo
          <input type="file" hidden />
        </Button>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Family Name"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Date of Birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Estimated DOB?"
              name="estimatedDob"
              value={formData.estimatedDob}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="F">Female</MenuItem>
              <MenuItem value="M">Male</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Marital Status"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="IOM Individual No."
              name="iomIndividualNo"
              value={formData.iomIndividualNo}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    <Typography variant="h6" style={{ marginTop: '16px' }}>
      Migration Information
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          label="Type of Migration"
          name="migrationType"
          value={formData.migrationType}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="Resettlement">Resettlement</MenuItem>
          <MenuItem value="Asylum">Asylum</MenuItem>
        </TextField>
        <TextField
          select
          label="Migrant Type/Classification"
          name="migrantType"
          value={formData.migrantType}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="Refugee">Refugee</MenuItem>
          <MenuItem value="Asylee">Asylee</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          label="Immigration Status"
          name="immigrationStatus"
          value={formData.immigrationStatus}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
        </TextField>
        <TextField
          label="Estimated Date of Arrival"
          name="estimatedArrival"
          value={formData.estimatedArrival}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Confirmed Date of Arrival"
          name="confirmedArrival"
          value={formData.confirmedArrival}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </Grid>
    </Grid>
  </Box>
);

export default ParticipantDetails;
