import React from "react";
import { Card, Button } from "antd";

class Error extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.keyPressListener = this.keyPressListener.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    window.addEventListener("keypress", this.keyPressListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keypress", this.keyPressListener);
  }

  keyPressListener(e) {
    if (e.key === "Enter") this.submit();
  }

  submit() {
    this.props.retryCb();
  }

  render() {
    return (
      <center>
        <Card title="Error" bordered={true} style={{ maxWidth: "500px" }}>
          <p>{this.props.msg}</p>
          {this.props.retryCb ? (
            <Button
              id="submitButton"
              onClick={this.submit}
              //@ts-expect-error - danger type is missing in antd
              type="danger"
            >
              {this.props.btnMsg || "Retry"}
            </Button>
          ) : null}
        </Card>
      </center>
    );
  }
}

export default Error;
