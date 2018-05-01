package com.theironyard.entities;

import javax.persistence.*;

/**
 * Created by keatonfoster on 4/8/16.
 */
@Entity
@Table(name = "joins")
public class Join {

    // VARAIBLES
    @Id
    @GeneratedValue
    int id;

    @ManyToOne
    User user;

    @ManyToOne
    Sesh sesh;

    //CONSTRUCTORS
    public Join() {
    }

    public Join(User user, Sesh sesh) {
        this.user = user;
        this.sesh = sesh;
    }

    // GETTERS/SETTERS
    public Sesh getSesh() {
        return sesh;
    }

    public void setSesh(Sesh sesh) {
        this.sesh = sesh;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
