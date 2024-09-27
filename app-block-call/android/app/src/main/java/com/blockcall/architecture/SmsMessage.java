package com.blockcall.architecture;

/*
*     1. _id: The unique identifier for the SMS message.
      2. address: The phone number or address from which the SMS was sent or received.
      3. body: The actual content of the SMS message.
      4. date: The timestamp of when the SMS was sent or received (in milliseconds).
      5. type: The type of the SMS message (e.g., incoming, outgoing, draft).
      6. thread_id: The ID of the conversation thread to which this SMS belongs.
      7. read: A boolean indicating whether the SMS has been read (1 for read, 0 for unread).
      8. status: The status of the SMS message (e.g., sent, failed).
* */

public class SmsMessage {
    String id;
    String address;
    String body;
    long date;
    int type;
    int read;
    String status;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public long getDate() {
        return date;
    }

    public void setDate(long date) {
        this.date = date;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public int isRead() {
        return read;
    }

    public void setRead(int read) {
        this.read = read;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
