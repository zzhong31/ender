import './App.css';
import React, { useState, useEffect } from 'react';

const App = () => {
  const [propertiesList, setPropertiesList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [propertyDetails, setPropertyDetails] = useState({});
  const [currentLeases, setCurrentLeases] = useState([]);
  const token = { token: 'dde70fd6-b600-43cd-b1d9-33250337b31a' };

  function parseNumber(value, locales = navigator.languages) {
    const example = Intl.NumberFormat(locales).format('1.1');
    const cleanPattern = new RegExp(`[^-+0-9${example.charAt(1)}]`, 'g');
    const cleaned = value.replace(cleanPattern, '');
    const normalized = cleaned.replace(example.charAt(1), '.');

    return parseFloat(normalized);
  }

  useEffect(() => {
    const getProperties = async () => {
      fetch('https://talent.ender.com/fe-challenge/properties', {
        method: 'POST',
        body: JSON.stringify(token)
      })
        .then((response) => response.json())
        .then((data) => setPropertiesList(data));
    };
    getProperties();
  }, []);

  useEffect(() => {
    const getPropertyLeases = async () => {
      fetch(
        `https://talent.ender.com/fe-challenge/properties/${selectedProperty.id}/leases`,
        {
          method: 'POST',
          body: JSON.stringify(token)
        }
      )
        .then((response) => response.json())
        .then((data) => {
          const currentPropertyDetails = propertyDetails;
          currentPropertyDetails[selectedProperty.id] = data;
          setPropertyDetails(currentPropertyDetails);
          setCurrentLeases(
            propertyDetails[selectedProperty.id]
              ? propertyDetails[selectedProperty.id]
              : []
          );
        });
    };
    if (selectedProperty.id && !propertyDetails[selectedProperty.id])
      getPropertyLeases();
    else {
      setCurrentLeases(
        propertyDetails[selectedProperty.id]
          ? propertyDetails[selectedProperty.id]
          : []
      );
    }
  }, [selectedProperty]);

  const renderPropertyCards = () => {
    const cards = propertiesList.map((property) => {
      return (
        <div
          className='propertyCard'
          key={property.id}
          onClick={() => setSelectedProperty(property)}
        >
          <div
            style={{
              width: '100%',
              minHeight: '50px',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {property.name}
          </div>
          <div
            style={{
              display: 'flex',
              flexFlow: 'column',
              borderTop: '1px black solid',
              padding: '10px'
            }}
          >
            <div style={{ display: 'flex' }}>
              <div
                style={{ width: '70%', display: 'flex', flexFlow: 'column' }}
              >
                <div>{property.address1}</div>
                <div>{property.address2}</div>
              </div>
              <div
                style={{
                  width: '30%',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                {property.baseRent}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '20px',
                justifyContent: 'space-between'
              }}
            >
              <div>{property.sqft + ' sqft.'}</div>
              <div>{`$${(
                parseNumber(property.baseRent) / property.sqft
              ).toFixed(2)} sqft/mo`}</div>
              <div>{`$${(
                (parseNumber(property.baseRent) * 12) /
                property.sqft
              ).toFixed(2)} sqft/year`}</div>
            </div>
          </div>
        </div>
      );
    });
    return cards;
  };

  const renderPropertyLeasesTable = () => {
    const leases =
      currentLeases?.length > 0 &&
      currentLeases.map((lease) => {
        const contacts = Object.keys(lease.contacts);
        const primaryTenant = contacts.find((contact) =>
          lease.contacts[contact].tags.includes('PRIMARY')
        );
        const tenants = contacts.filter((contact) =>
          lease.contacts[contact].tags.includes('TENANT')
        );
        return tenants.map((tenant) => (
          <tr style={{ border: '1px LightGrey solid' }} key={tenant}>
            <td className='tableRowText'>{tenant}</td>
            <td className='tableRowText'>{lease.startDate}</td>
            <td className='tableRowText'>{lease.inclusiveEndDate}</td>
            <td className='tableRowText'>{lease.status}</td>
            <td className='tableRowText'>
              {primaryTenant ? primaryTenant : 'None'}
            </td>
          </tr>
        ));
      });
    return (
      <table style={{ borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'LightGrey' }}>
          <tr>
            <th className='tableHeaderText' style={{ minWidth: '200px' }}>
              Tenant
            </th>
            <th className='tableHeaderText'>Start Date</th>
            <th className='tableHeaderText'>End Date</th>
            <th className='tableHeaderText'>Lease Status</th>
            <th className='tableHeaderText'>Primary Contact</th>
          </tr>
        </thead>
        <tbody>
          {currentLeases.length > 0 ? (
            leases
          ) : (
            <tr
              style={{
                border: '1px LightGrey solid',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              <td colSpan='5' style={{ padding: '10px' }}>
                No Leases Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };
  return (
    <div id='app' style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {propertiesList.length > 0 ? renderPropertyCards() : 'Loading...'}
      </div>
      {selectedProperty.id && (
        <div style={{ display: 'flex', marginTop: '30px', flexFlow: 'column' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {selectedProperty.name + ' Leases'}
          </div>
          <div style={{ marginTop: '20px' }}>{renderPropertyLeasesTable()}</div>
        </div>
      )}
    </div>
  );
};

export default App;
