/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author jmvillatei
 */
@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private Integer channel;
    private HashMap<Integer, ArrayList<Point>> points = new HashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public synchronized void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:" + pt);

        channel = Integer.parseInt(numdibujo);
        if (!points.containsKey(channel)) {
            ArrayList<Point> arrayToAdd = new ArrayList<>();
            points.put(channel, arrayToAdd);
        }

        points.get(channel).add(pt);
        msgt.convertAndSend("/topic/newpoint." + channel, pt);

        if (!(points.get(channel).size() < 4)) {
            msgt.convertAndSend("/topic/newpolygon." + channel, points.get(channel));
            points.get(channel).clear();
        }
    }
}
