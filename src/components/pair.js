import React from 'react';
import { Card, Col, Row, Input } from 'antd'
import 'antd/dist/antd.css'

const INPUT_STYLE = {
  'margin': '20px 0 0 0',
  'textAlign': 'center',
  'backgroundColor': '#1890ff',
  'color': 'white',
  'fontFamily': 'Andale Mono;Courier',
  'letterSpacing': '10px'
}

class Pair extends React.Component {

  componentDidMount() {
    this.input.focus()
    const height = document.getElementById("secret").offsetHeight
    if (height > 0)
      INPUT_STYLE['fontSize'] = 0.9 * height
  }

  handleUpdate(e) {
    if (e.target.value.length > 7)
      this.props.submit(e.target.value)
  }

  render() {
    const spanWidth = this.props.isMobile() ? 24 : 10;
    const spanOffset = this.props.isMobile() ? 0 : 7;
    const size = this.props.isMobile() ? 'small' : 'large';
    const searchWidth = this.props.isMobile() ? "100%" : "80%";
    return (
     <Row>
        <Col span={spanWidth} offset={spanOffset}>
          <center>
            <Card title="Enter Secret" bordered={true}>
              <p></p>
              <p>Please enter the pairing secret displayed on your Lattice screen:</p>
              <Input 
                size={size} 
                id="secret"
                ref={i => {this.input = i}}
                onChange={this.handleUpdate.bind(this)}
                style={{width: searchWidth, ...INPUT_STYLE}}
              />
            </Card>
          </center>
        </Col>
      </Row>
    )
  }
}

export default Pair