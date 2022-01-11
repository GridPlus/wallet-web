import React from 'react';
import 'antd/dist/antd.dark.css'
import { Col, Row } from 'antd'
const SPAN_WIDTH = 14; // Max 24 for 100% width

class PageContent extends React.Component<any, any> {
  render () {
    if (!this.props.content)
      return; // Content must be passed in
    // Mobile content should be displayed without any padding
    if (this.props.isMobile && this.props.isMobile())
      return this.props.content;
    // Desktop content has some padding
    return(
      <Row justify="center">
        <Col span={SPAN_WIDTH}>
          {this.props.content}
        </Col>
      </Row>
    )
  }
}

export default PageContent;