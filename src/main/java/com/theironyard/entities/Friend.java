package com.theironyard.entities;

import javax.persistence.*;

/**
 * Created by keatonfoster on 4/11/16.
 */
@Entity
@Table(name = "friends")
public class Friend {

    @Id
    @GeneratedValue
    int id;

    // USER DOING THE FRIENDING
    @ManyToOne
    User requester;

    // USER BEING FRIENDED
    @ManyToOne
    User approver;

    @Column(nullable = true)
    boolean isApproved;

    public Friend() {
    }

    public Friend(User requester, User approver) {
        this.requester = requester;
        this.approver = approver;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public User getApprover() {
        return approver;
    }

    public void setApprover(User approver) {
        this.approver = approver;
    }

    public boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(boolean isApproved) {
        this.isApproved = isApproved;
    }

    //    public boolean getIsFriend() {
//        return isFriend;
//    }
//
//    public void setIsFriend(boolean isFriend) {
//        this.isFriend = isFriend;
//    }
//
//    public boolean isInvitationStage() {
//        return invitationStage;
//    }
//
//    public void setInvitationStage(boolean invitationStage) {
//        this.invitationStage = invitationStage;
//    }
}
