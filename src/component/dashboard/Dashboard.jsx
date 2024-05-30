import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import  Card  from 'react-bootstrap/Card';
import  Button  from 'react-bootstrap/Button';
import Placeholder from 'react-bootstrap/Placeholder';

const Dashboard = ({ startDate, endDate }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                                <Spinner animation="grow" />
                              </div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container className='content'>
      <Row >
        {data && data.map((item, index) => (
          <Col key={index} xs={12} sm={4} md={4} lg={3} xl={2}>
            <Card style={{ width: '18rem', paddingRight : '95px' }}>
              <Card.Img variant="top" src="https://www.h24info.ma/wp-content/uploads/2022/09/gendarmerie2022.jpg" />
              <Card.Body>
                <Card.Title>{item.name || 'Card Title'}</Card.Title>
                <Placeholder as="p" animation="glow">
                  {/* <Placeholder xs={6} /> */}
                  {item.description || 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'}
                </Placeholder>
                <Card.Text>
                  {item.description || 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'}
                </Card.Text>
                <Button variant="primary">Go somewhere</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
