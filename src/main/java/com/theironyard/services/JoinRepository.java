package com.theironyard.services;

import com.theironyard.entities.Join;
import com.theironyard.entities.Sesh;
import com.theironyard.entities.User;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by keatonfoster on 4/8/16.
 */
public interface JoinRepository extends CrudRepository<Join, Integer> {
    List<Join> findAllBySesh(Sesh sesh);
    List<Join> findAllByUser(User user);
    Join findFirstByUserAndSesh (User user, Sesh sesh);
}
