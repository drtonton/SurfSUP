package com.theironyard.services;

import com.theironyard.entities.Friend;
import com.theironyard.entities.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by keatonfoster on 4/11/16.
 */
public interface FriendRepository extends CrudRepository<Friend, Integer> {
    List <Friend> findAllByRequester (User requester);
    List <Friend> findAllByApprover (User approver);
    Friend findFirstByRequesterAndApprover (User requester, User approver);
    Friend findFirstByApproverAndRequester (User approver, User requester);
}
