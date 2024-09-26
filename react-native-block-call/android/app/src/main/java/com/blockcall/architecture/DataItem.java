package com.blockcall.architecture;

public class DataItem {

    private int id;
    private String phoneNumber;
    private String type;
    private String detail;
    private String reporter;

    public DataItem(){}

    // Constructor
    public DataItem(int id, String phoneNumber, String type, String detail, String reporter) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.type = type;
        this.detail = detail;
        this.reporter = reporter;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getType() {
        return type;
    }

    public String getDetail() {
        return detail;
    }

    public String getReporter() {
        return reporter;
    }

    // Optionally, you can also implement setters if needed
    public void setId(int id) {
        this.id = id;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public void setReporter(String reporter) {
        this.reporter = reporter;
    }
}
